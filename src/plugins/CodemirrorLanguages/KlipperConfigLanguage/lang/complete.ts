import { CompletionContext } from '@codemirror/autocomplete'
import { syntaxTree } from '@codemirror/language'
import { EditorState } from '@codemirror/state'
import { SyntaxNode } from '@lezer/common'
import { exampleText, parseConfigMd, printConfigMd } from '../ref-parser/ref-parser'

//parse Config Reference
const [parsedMd, dependentParameters] = parseConfigMd(exampleText)
//Map with all autocompletion-objects (for each parameter one) for each blocktype
const autocompletionMap = new Map<string, { label: string; type: string; info: string }[]>()
parsedMd.forEach((entry) => {
    const parameters = entry.parameters.flatMap((parameter) => ({
        label: parameter.name + ': ',
        type: 'variable',
        detail: parameter.isOptional ? '(optional)' : '(required)',
        info: parameter.tooltip,
    }))
    autocompletionMap.set(entry.type, parameters)
})
//Map with all autocompletion-objects (for each parameter one) for each trigger parameter
const dependentParametersMap = new Map<string, { label: string; type: string; info: string }[]>()
dependentParameters.forEach((entry) => {
    const parameters = entry.parameters.flatMap((parameter) => ({
        label: parameter.name + ': ',
        type: 'variable',
        detail: parameter.isOptional ? '(optional)' : '(required)',
        info: parameter.tooltip,
    }))
    dependentParametersMap.set(entry.triggerParameter, parameters)
})

export function klipperConfigCompletionSource(context: CompletionContext) {
    printConfigMd()
    const parent = syntaxTree(context.state).resolveInner(context.pos, -1)
    const tagBefore = getTagBefore(context.state, parent.from, context.pos)

    // If writing Parameter node
    if (parent?.type.name === 'Parameter') {
        const typeNode = findTypeNode(parent)
        if (!typeNode) return null
        // blocktype like [printer] or [extruder]
        const blocktype = context.state.sliceDoc(typeNode.from, typeNode.to)
        let options = getOptionsByBlockType(blocktype, context.state, typeNode)
        if (options == null) return null
        // remove allready used options and if this config block includes a trigger parameter, add dependent parameters to options
        options = editOptions(options, context.state, parent)
        return {
            from: tagBefore ? parent.from + tagBefore.index : context.pos,
            options: options,
            validFor: /^(\w*)?$/,
        }
    }
    // If writing BlockType node
    else if (parent.parent?.type.name === 'ConfigBlock') {
        return {
            from: tagBefore ? parent.from + tagBefore.index : context.pos,
            options: getAllPossibleBlockTypes(context.state, parent),
            validFor: /^(\w*)?$/,
        }
    }
    // If not return null
    else {
        return null
    }
}

function findTypeNode(node: SyntaxNode) {
    let travNode: SyntaxNode | null = node
    while (travNode) {
        if (travNode.type.name === 'ConfigBlock') {
            return travNode.firstChild
        }
        travNode = travNode.parent
    }
    return null
}

function findPrinterNode(node: SyntaxNode, state: EditorState) {
    const typeNode = findTypeNode(node)
    // if node is [printer] return it
    if (typeNode && typeNode.type.name === 'printer') {
        return typeNode
    }
    // if not find Programm node
    let programmNode = null
    // if node is a [Block] go to Programm node
    if (typeNode) programmNode = typeNode.parent?.parent ?? null
    // if typeNode is null node bust be the Programm node
    else programmNode = node
    const printerNode =
        programmNode?.getChildren('ConfigBlock')?.find((configBlockNode) => {
            const blockTypeNode = configBlockNode.firstChild
            if (!blockTypeNode) return false
            return state.sliceDoc(blockTypeNode.from, blockTypeNode.to) === 'printer'
        }) ?? null
    return printerNode
}

function getTagBefore(state: EditorState, from: number, pos: number) {
    const textBefore = state.sliceDoc(from, pos)
    return /\w*$/.exec(textBefore)
}

function getOptionsByBlockType(blocktype: string, state: EditorState, node: SyntaxNode) {
    let options: { label: string; type: string; info: string }[] = []
    // if block is a stepper block, add stepper_x options or stepper_z1 options if its a secondary stepper
    if (blocktype.includes('stepper_')) {
        options = autocompletionMap.get(blocktype + '--' + getPrinterKinematics(state, node)) ?? []
        if (/\d/.test(blocktype)) {
            return options.concat(autocompletionMap.get('stepper_z1') ?? [])
        } else {
            return options.concat(autocompletionMap.get('stepper_x') ?? [])
        }
    } else if (autocompletionMap.has(blocktype)) {
        options = autocompletionMap.get(blocktype) ?? []
    } else {
        options = autocompletionMap.get(blocktype + '--' + getPrinterKinematics(state, node)) ?? []
    }
    if (blocktype.includes('extruder') && /\d/.test(blocktype)) {
        return options.concat(autocompletionMap.get('extruder1') ?? [])
    } else return options
}

function editOptions(options: { label: string; type: string; info: string }[], state: EditorState, node: SyntaxNode) {
    const allreadyUsedOptions = new Set<string>()
    // for all options in the current config block check if it is a trigger parameters and add dependent parameters if necessary
    for (const childNode of node.parent?.parent?.getChildren('Option') ?? []) {
        const parameter = childNode.firstChild
        const value = childNode.lastChild
        if (!parameter || !value) continue
        const parameterName = state.sliceDoc(parameter.from, parameter.to).trim()
        if (!parameterName.endsWith('_')) allreadyUsedOptions.add(parameterName) // save allready used options to remove them later (not "variable_")
        const valueName = state.sliceDoc(value.from, value.to).replace(/(\r\n|\n|\r)/gm, '')
        const parameterValue = valueName !== '' ? parameterName + ':' + valueName : parameterName
        const mapEntry = dependentParametersMap.get(parameterValue)
        if (mapEntry) {
            options = options.concat(mapEntry)
        }
    }
    // remove all options that are already used in the current config block
    return (options = options.filter((option) => !allreadyUsedOptions.has(option.label.replace(': ', ''))))
}

function getPrinterKinematics(state: EditorState, node: SyntaxNode) {
    const printerOptions = findPrinterNode(node, state)?.getChild('Body')?.getChildren('Option') ?? []
    for (const childNode of printerOptions) {
        const parameter = childNode.firstChild
        const value = childNode.lastChild
        if (!parameter || !value) continue
        const parameterName = state.sliceDoc(parameter.from, parameter.to)
        if (parameterName !== 'kinematics') continue
        const printerKinematics = state.sliceDoc(value.from, value.to).replace(/(\r\n|\n|\r)/gm, '')
        return printerKinematics
    }
    return ''
}

function getAllPossibleBlockTypes(state: EditorState, node: SyntaxNode) {
    const printerKinematics = '--' + getPrinterKinematics(state, node)
    console.log(printerKinematics)
    const blockTypes = Array.from(autocompletionMap.keys())
        .filter(
            (blockType) =>
                (blockType.includes('--') && blockType.includes(printerKinematics)) || !blockType.includes('stepper_')
        )
        .map((blockType) => ({
            label: blockType.includes('--') ? blockType.split('-')[0] : blockType,
            type: 'keyword',
        }))
    return blockTypes
}

/* 
Known Issues:
- secondary stepper/extruder-names are not suggested (only stepper_z1/extruder1)
- wcomments after [block] -> suggestions are shown as if writing inside []
- 

*/

import { CompletionContext } from '@codemirror/autocomplete'
import { syntaxTree } from '@codemirror/language'
import { EditorState } from '@codemirror/state'
import { SyntaxNode } from '@lezer/common'
import { exampleText, parseConfigMd, printConfigMd } from '../ref-parser/ref-parser'

// Parse Config Reference
const [parsedMd, dependentParameters] = parseConfigMd(exampleText)

// Map with all autocompletion objects for each blocktype
const autocompletionMap = new Map<string, { label: string; type: string; info: string }[]>()

// Map with all autocompletion objects for each trigger parameter
const dependentParametersMap = new Map<string, { label: string; type: string; info: string }[]>()

function createParameterObject(parameter: any) {
    return {
        label: `${parameter.name}: `,
        type: 'variable',
        detail: parameter.isOptional ? '(optional)' : '(required)',
        info: parameter.tooltip,
    }
}

// Populate autocompletionMap
parsedMd.forEach((entry) => {
    const parameters = entry.parameters.map(createParameterObject)
    autocompletionMap.set(entry.type, parameters)
})

// Populate dependentParametersMap
dependentParameters.forEach((entry) => {
    const parameters = entry.parameters.map(createParameterObject)
    dependentParametersMap.set(entry.triggerParameter, parameters)
})

export function klipperConfigCompletionSource(context: CompletionContext) {
    printConfigMd()
    const parent = syntaxTree(context.state).resolveInner(context.pos, -1)
    const tagBefore = getTagBefore(context.state, parent.from, context.pos)

    if (parent?.type.name === 'Comment') return null

    if (parent?.type.name === 'Parameter') {
        const typeNode = findTypeNode(parent)
        if (!typeNode) return null
        const blockType = context.state.sliceDoc(typeNode.from, typeNode.to)
        const options = getOptionsByBlockType(blockType, context.state, parent)
        if (options == null) return null

        return {
            from: tagBefore ? parent.from + tagBefore.index : context.pos,
            options: options,
            validFor: /^(\w*)?$/,
        }
    }

    if (parent?.parent?.type.name === 'ConfigBlock') {
        return {
            from: tagBefore ? parent.from + tagBefore.index : context.pos,
            options: getAllPossibleBlockTypes(context.state, parent),
            validFor: /^(\w*)?$/,
        }
    }

    return null
}

function getTagBefore(state: EditorState, from: number, pos: number) {
    const textBefore = state.sliceDoc(from, pos)
    return /\w*$/.exec(textBefore)
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
    // If node is [printer] return it
    if (typeNode && typeNode.type.name === 'printer') {
        return typeNode
    }
    // If not, find Programm node and search for printer node from there
    let programmNode = null
    if (typeNode) programmNode = typeNode.parent?.parent ?? null // If node is a typeNode go up to Programm node
    else programmNode = node // If typeNode is null, node must be the Programm node or inside inport (here not important)
    const printerNode =
        programmNode?.getChildren('ConfigBlock')?.find((configBlockNode) => {
            const blockTypeNode = configBlockNode.firstChild
            if (!blockTypeNode) return false
            return state.sliceDoc(blockTypeNode.from, blockTypeNode.to) === 'printer'
        }) ?? null
    return printerNode
}

function getPrinterKinematics(state: EditorState, node: SyntaxNode) {
    const printerOptions = findPrinterNode(node, state)?.getChild('Body')?.getChildren('Option') ?? []
    for (const childNode of printerOptions) {
        const parameter = childNode.getChild('Parameter')
        const value = childNode.getChild('Value')
        if (!parameter || !value) continue
        const parameterName = state.sliceDoc(parameter.from, parameter.to)
        if (parameterName !== 'kinematics') continue
        const printerKinematics = state.sliceDoc(value.from, value.to).replace(/(\r\n|\n|\r)/gm, '')
        return printerKinematics.split('#')[0].trim()
    }
    return ''
}

function getOptionsByBlockType(blocktype: string, state: EditorState, parentNode: SyntaxNode) {
    let options: { label: string; type: string; info: string }[] = []
    const printerKinematics = getPrinterKinematics(state, parentNode)
    if (blocktype.includes('stepper_')) {
        1
        const stepperOptions = autocompletionMap.get(blocktype + '--' + printerKinematics)
        const secondaryStepperOptions = /\d/.test(blocktype)
            ? autocompletionMap.get('stepper_z1')
            : autocompletionMap.get('stepper_x')
        if (stepperOptions) {
            options.push(...stepperOptions)
        }
        if (secondaryStepperOptions) {
            options.push(...secondaryStepperOptions)
        }
    } else {
        const optionsForBlockType =
            autocompletionMap.get(blocktype) || autocompletionMap.get(blocktype + '--' + printerKinematics)
        if (optionsForBlockType) {
            options.push(...optionsForBlockType)
        }
    }
    if (blocktype.includes('extruder') && /\d/.test(blocktype)) {
        const secondaryExtruderOptions = autocompletionMap.get('extruder1')
        if (secondaryExtruderOptions) {
            options.push(...secondaryExtruderOptions)
        }
    }
    return editOptions(options, state, parentNode)
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

function getAllPossibleBlockTypes(state: EditorState, node: SyntaxNode) {
    const printerKinematics = getPrinterKinematics(state, node)
    let blockTypes = Array.from(autocompletionMap.keys())
    if (printerKinematics !== '') {
        // all blockTypes but if stepper_ only these which match the printerKinematics
        blockTypes = blockTypes.filter(
            (blockType) => !blockType.includes('stepper_') || blockType.includes('--' + printerKinematics)
        )
    }
    return blockTypes.map((blockType) => ({
        label: blockType.includes('--') ? blockType.split('-')[0] : blockType,
        type: 'keyword',
    }))
}

//Known Issues: secondary stepper/extruder-names are not suggested (only stepper_z1/extruder1)

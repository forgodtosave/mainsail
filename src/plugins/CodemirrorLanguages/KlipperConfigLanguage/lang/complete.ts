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
//Map with all autocompletion-objects for all blocktype
const blockTypeOptions = Array.from(autocompletionMap.keys()).map((tag) => ({
    label: tag.includes('stepper_') && tag.includes('-') ? tag.split('-')[0] : tag,
    type: 'keyword',
}))

export function klipperConfigCompletionSource(context: CompletionContext) {
    printConfigMd()
    const parent = syntaxTree(context.state).resolveInner(context.pos, -1)
    const tagBefore = getTagBefore(context.state, parent.from, context.pos)

    // if node is a Parameter
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
    // if node is a ConfigBlock
    else if (parent.parent?.type.name === 'ConfigBlock') {
        return {
            from: tagBefore ? parent.from + tagBefore.index : context.pos,
            options: blockTypeOptions,
            validFor: /^(\w*)?$/,
        }
    }
    // if not return null
    else {
        return null
    }
}

function findTypeNode(node: SyntaxNode | null) {
    while (node) {
        if (node.type.name === 'ConfigBlock') {
            return node.firstChild
        }
        node = node.parent
    }
    return null
}

function getTagBefore(state: EditorState, from: number, pos: number) {
    const textBefore = state.sliceDoc(from, pos)
    return /\w*$/.exec(textBefore)
}

function getOptionsByBlockType(blocktype: string, state: EditorState, node: SyntaxNode) {
    // if block is a stepper block, add stepper_x options or stepper_z1 options if its a secondary stepper
    if (blocktype.includes('stepper_')) {
        const options = autocompletionMap.get(blocktype + '-' + getPrinterKinematics(state, node)) ?? []
        if (/\d/.test(blocktype)) {
            return options.concat(autocompletionMap.get('stepper_z1') ?? [])
        } else {
            return options.concat(autocompletionMap.get('stepper_x') ?? [])
        }
    } else {
        const options = autocompletionMap.get(blocktype) ?? []
        if (blocktype.includes('extruder') && /\d/.test(blocktype)) {
            return options.concat(autocompletionMap.get('extruder1') ?? [])
        } else return options
    }
}

function editOptions(options: { label: string; type: string; info: string }[], state: EditorState, node: SyntaxNode) {
    const allreadyUsedOptions = new Set<string>()
    // for all options in the current config block check if it is a trigger parameters and add dependent parameters if necessary
    for (const childNode of node.parent?.parent?.getChildren('Option') ?? []) {
        const parameter = childNode.firstChild
        const value = childNode.lastChild
        if (!parameter || !value) continue
        const parameterName = state.sliceDoc(parameter.from, parameter.to)
        if (parameterName[-1] !== '_') allreadyUsedOptions.add(parameterName) // save allready used options to remove them later (not variable_)
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
    for (const childNode of node.parent?.getChildren('Option') ?? []) {
        const parameter = childNode.firstChild
        const value = childNode.lastChild
        if (!parameter || !value) continue
        const parameterName = state.sliceDoc(parameter.from, parameter.to)
        if (parameterName !== 'kinematics') continue
        const valueName = state.sliceDoc(value.from, value.to).replace(/(\r\n|\n|\r)/gm, '')
        return valueName
    }
    return ''
}

/* 
Known Issues:
- secondary stepper/extruder-names are not suggested (only stepper_z1/extruder1)
- while typing the block-name the stepper names ar incorrect - fixed?
- 

*/

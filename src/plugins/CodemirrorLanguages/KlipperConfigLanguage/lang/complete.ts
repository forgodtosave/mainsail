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
    label: tag,
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
        let options = getOptionsByBlockType(blocktype)
        if (options == null) return null
        // if this config block includes a trigger parameter, add dependent parameters to options and remove allready used options
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

function getOptionsByBlockType(blocktype: string) {
    return autocompletionMap.get(blocktype) ?? []
}

function editOptions(options: { label: string; type: string; info: string }[], state: EditorState, node: SyntaxNode) {
    const allreadyUsedOptions = new Set<string>()
    // for all options in the current config block ckheck if they are trigger parameters and add dependent parameters if necessary
    for (const childNode of node.parent?.parent?.getChildren('Option') ?? []) {
        const parameter = childNode.firstChild
        const value = childNode.lastChild
        if (!parameter || !value) continue
        const parameterName = state.sliceDoc(parameter.from, parameter.to)
        // save allready used options to remove them later
        allreadyUsedOptions.add(parameterName)
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

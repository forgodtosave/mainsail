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
    const parameters = entry.parameters.map((parameter) => ({
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
    const parameters = entry.parameters.map((parameter) => ({
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
    //printConfigMd()
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

        // if this configblock includes a trigger parameter -> add dependet parameters to options
        const dependentOptions = getDependentParametersByCurrentState(context.state, parent)
        console.log(dependentOptions)
        console.log(options)
        if (dependentOptions != null) options = options.concat(dependentOptions)
        console.log(options)
        return {
            from: tagBefore ? parent.from + tagBefore.index : context.pos,
            options: options,
            validFor: /^(\w*)?$/,
        }

        // if node is a ConfigBlock
    } else if (parent.parent?.type.name === 'ConfigBlock') {
        return {
            from: tagBefore ? parent.from + tagBefore.index : context.pos,
            options: blockTypeOptions,
            validFor: /^(\w*)?$/,
        }
        // if not return null
    } else {
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
    if (autocompletionMap.has(blocktype)) {
        return autocompletionMap.get(blocktype)
    }
    return null
}

function getDependentParametersByCurrentState(state: EditorState, node: SyntaxNode) {
    for (const childNode of node.parent?.parent?.getChildren('Option') || []) {
        const parameter = childNode.firstChild
        const value = childNode.lastChild
        if (!parameter || !value) continue
        const parameterName = state.sliceDoc(parameter.from, parameter.to)
        const valueName = state.sliceDoc(value.from, value.to).replace(/(\r\n|\n|\r)/gm, '')
        const optionName = valueName !== '' ? parameterName + ':' + valueName : parameterName
        if (dependentParametersMap.has(optionName)) {
            return dependentParametersMap.get(optionName)
        }
    }
    return null
}

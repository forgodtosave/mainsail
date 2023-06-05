import { CompletionContext } from '@codemirror/autocomplete'
import { syntaxTree } from '@codemirror/language'
import { EditorState } from '@codemirror/state'
import { SyntaxNode } from '@lezer/common'
import { exampleText, parseConfigMd, printConfigMd } from '../ref-parser/ref-parser'

const [parsedMd, dependentParameters] = parseConfigMd(exampleText)
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

const blockTypeOptions = Array.from(autocompletionMap.keys()).map((tag) => ({
    label: tag,
    type: 'namespace',
}))

export function klipperConfigCompletionSource(context: CompletionContext) {
    const parent = syntaxTree(context.state).resolveInner(context.pos, -1)
    if (!parent) return null
    const tagBefore = getTagBefore(context.state, parent.from, context.pos)

    if (parent.type.name === 'Parameter') {
        const typeNode = findTypeNode(parent)
        if (!typeNode) return null
        const blocktype = context.state.sliceDoc(typeNode.from, typeNode.to)
        const options = getOptionsByBlockType(blocktype)
        return {
            from: tagBefore ? parent.from + tagBefore.index : context.pos,
            options: options,
            validFor: /^(\w*)?$/,
        }
    }

    if (parent.parent?.type.name === 'ConfigBlock') {
        return {
            from: tagBefore ? parent.from + tagBefore.index : context.pos,
            options: blockTypeOptions,
            validFor: /^(\w*)?$/,
        }
    }

    return null
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
    } else {
        return null
    }
}

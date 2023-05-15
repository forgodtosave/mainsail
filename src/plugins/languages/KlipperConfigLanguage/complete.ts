import { CompletionContext } from '@codemirror/autocomplete'
import { syntaxTree } from '@codemirror/language'

const parameterOptions = ['serial', 'baud', 'canbus_uuid', 'canbus_interface', 'restart_method'].map((tag) => ({
    label: tag + ': ',
    type: 'keyword',
}))

export function klipperConfigCompletionSource(context: CompletionContext) {
    let parent = syntaxTree(context.state).resolveInner(context.pos, -1)
    if (parent == null) return null
    let parent0 = parent
    while (parent.type.name != 'Body') {
        if (parent.parent == null) return null
        parent = parent.parent
    }
    let sibling = parent.prevSibling
    if (sibling == null) return null
    let blocktype = context.state.sliceDoc(sibling.from, sibling.to)

    if (blocktype == 'mcu') {
        let textBefore = context.state.sliceDoc(parent0.from, context.pos)
        let tagBefore = /\w*$/.exec(textBefore)
        return {
            from: tagBefore ? parent0.from + tagBefore.index : context.pos,
            options: parameterOptions,
            validFor: /^(\w*)?$/,
        }
    } else return null
}

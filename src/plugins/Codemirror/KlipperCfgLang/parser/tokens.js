/* ref: https://github.com/lezer-parser/python/blob/main/src/tokens.js */
import { ExternalTokenizer, ContextTracker } from '@lezer/lr'

import { newline as newlineToken, eof, blankLine, Indent, Dedent } from '../parser/klipperCfgParser.terms.js'

const newline = 10,
    carriageReturn = 13,
    space = 32,
    tab = 9,
    hash = 35,
    star = 42

function isLineBreak(ch) {
    return ch == newline || ch == carriageReturn
}

export const newlines = new ExternalTokenizer(
    (input, stack) => {
        let prev
        if (input.next < 0) {
            input.acceptToken(eof)
        } else if ((prev = input.peek(-1)) < 0 || isLineBreak(prev)) {
            while (input.next == space || input.next == tab) {
                input.advance()
            }
            if (isLineBreak(input.next)) input.acceptToken(blankLine, 1)
        } else if (isLineBreak(input.next)) {
            input.acceptToken(newlineToken, 1)
        }
    },
    { contextual: true }
)

export const indentation = new ExternalTokenizer((input, stack) => {
    let cDepth = stack.context.depth
    if (cDepth < 0) return
    let prev = input.peek(-1),
        depth
    if (prev == newline || prev == carriageReturn) {
        console.log('START', JSON.stringify(input.read(input.pos, input.pos + 5)))
        let depth = 0,
            chars = 0
        for (;;) {
            if (input.next == space) depth++
            else if (input.next == tab) depth += 8 - (depth % 8)
            else break
            input.advance()
            chars++
        }
        if ((input.next = hash && input.peek(1) == star && input.peek(2) == hash)) {
            if (input.peek(4) == tab) {
                console.log('Autogen-Indent', JSON.stringify(input.read(input.pos, input.pos + 4)))
                //input.acceptToken(Indent, 4)
            } else if (depth < cDepth) {
                console.log('Autogen-Dedent', JSON.stringify(input.read(input.pos, input.pos + 4)))
                //input.acceptToken(Dedent, 4)
            }
        } else if (depth != cDepth && !isLineBreak(input.next)) {
            if (depth < cDepth) {
                console.log('dedentation')
                console.log('|- depth', depth, 'cDepth', cDepth, '\n\n')
                input.acceptToken(Dedent, -chars)
            } else {
                console.log('indentation')
                console.log('|- depth', depth, 'cDepth', cDepth)
                input.acceptToken(Indent)
            }
        } else console.log('ELSE: depth', depth, 'cDepth', cDepth, '\n\n')
        /* if (input.next == hash && input.peek(1) == star && input.peek(2) == hash) {
            input.advance(3)
            //depth = 1
            //chars += 3
            if ((input.next = space)) input.advance()
            //console.log('AutoGen', JSON.stringify(input.read(input.pos, input.pos + 5)), depth, cDepth)
        } */
    }
})

function IndentLevel(parent, depth) {
    this.parent = parent
    // -1 means this is not an actual indent level but a set of brackets
    this.depth = depth
    this.hash = (parent ? (parent.hash + parent.hash) << 8 : 0) + depth + (depth << 4)
}

const topIndent = new IndentLevel(null, 0)

function countIndent(space) {
    let depth = 0
    let backup = space
    if (space.includes('#*#')) {
        space = space.split('#*# ')[1]
    } else space = space.slice(5, space.length - 1)
    for (let i = 0; i < space.length; i++) depth += space.charCodeAt(i) == tab ? 8 - (depth % 8) : 1
    console.log('|- countIndent', JSON.stringify(backup), depth, '\n\n')
    return depth
}

export const trackIndent = new ContextTracker({
    start: topIndent,
    reduce(context) {
        return context.depth < 0 ? context.parent : context
    },
    shift(context, term, stack, input) {
        if (term == Indent)
            return new IndentLevel(context, countIndent(input.read(input.pos, stack.pos)) >= 1 ? 1 : 0)
        if (term == Dedent) return context.parent
        return context
    },
    hash(context) {
        return context.hash
    },
})

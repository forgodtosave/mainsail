import { parser as klipperParser } from './klipperConfig.grammar'
import { parseMixed } from '@lezer/common'
import { LRLanguage, StreamLanguage } from '@codemirror/language'
import { jinja2 } from '@codemirror/legacy-modes/mode/jinja2'

const jinja2Parser = StreamLanguage.define(jinja2).parser

const mixedKlipperParser = klipperParser.configure({
    wrap: parseMixed((node) => {
        return node.name == 'Jinja2' ? { parser: jinja2Parser } : null
    }),
})

const mixedHTML = LRLanguage.define({ parser: mixedKlipperParser })

//@ts-ignore
import { parser } from './klipperConfigLang.js'
import { LRLanguage, LanguageSupport, StreamLanguage } from '@codemirror/language'
import { styleTags, tags as t } from '@lezer/highlight'
import { parseMixed } from '@lezer/common'
import { gcode } from '../../StreamParserGcode.js'

const jinja2Parser = StreamLanguage.define(gcode).parser

export const klipperConfigLang = LRLanguage.define({
    parser: parser.configure({
        props: [
            styleTags({
                ImportKeyword: t.keyword,
                Import: t.keyword,
                BlockType: t.keyword,

                Parameter: t.propertyName,
                Identifier: t.typeName,

                LineComment: t.lineComment,
                Boolean: t.bool,
                String: t.string,
                Number: t.number,
                Cords: t.number,
                Pin: t.atom,
                VirtualPin: t.atom,
                Path: t.className,
                File: t.className,
                Jinja2: t.typeName
            }),
        ],
        /* wrap: parseMixed((node) => {
            return node.name == 'Jinja2' ? { parser: jinja2Parser } : null
        }), */
    }),
    languageData: {
        commentTokens: { line: '#' },
    },
})

export function klipperConfig() {
    return new LanguageSupport(klipperConfigLang)
}

/* 
to generate the parser run:
npx @lezer/generator klipperConfig.grammar -o klipperConfigLang.js
 */

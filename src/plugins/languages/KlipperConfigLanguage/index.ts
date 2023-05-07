//@ts-ignore
import { parser } from './klipperConfigLang.js'
import {
    LRLanguage,
    LanguageSupport,
    indentNodeProp,
    foldNodeProp,
    foldInside,
    delimitedIndent,
} from '@codemirror/language'
import { styleTags, tags as t } from '@lezer/highlight'

export const klipperConfigLang = LRLanguage.define({
    parser: parser.configure({
        props: [
            /* indentNodeProp.add({
        Application: delimitedIndent({closing: ")", align: false})
      }), */
            /* foldNodeProp.add({
        Application: foldInside
      }), */
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
                Jinja2: t.typeName
            }),
        ],
    }),
    languageData: {
        commentTokens: { line: '#' },
    },
})

export function klipperConfig() {
    return new LanguageSupport(klipperConfigLang)
}

/* 
npx @lezer/generator klipperConfig.grammar -o klipperConfigLang.js
 */

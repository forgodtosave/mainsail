import { parser } from './klipperConfig.grammar'
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
                Import: t.keyword,
                Identifier: t.variableName,
                Boolean: t.bool,
                String: t.string,
                LineComment: t.lineComment,
                Number: t.number,
                BlockType: t.keyword,
                Parameter: t.variableName,
                Pin: t.number,

                /* "( )": t.paren */
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
npx @lezer/generator syntax.grammar -o klipperConfigLang.js
 */

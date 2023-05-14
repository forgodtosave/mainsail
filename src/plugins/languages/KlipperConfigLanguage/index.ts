//@ts-ignore
import { parser } from './klipperConfigLang.js'
import { LRLanguage, LanguageSupport, StreamLanguage, foldNodeProp, foldInside } from '@codemirror/language'
import { styleTags, tags as t } from '@lezer/highlight'
import { parseMixed } from '@lezer/common'
import { klipper_config } from '../../StreamParserKlipperConfig.js'

const jinja2Parser = StreamLanguage.define(klipper_config).parser

export const klipperConfigLang = LRLanguage.define({
    parser: parser.configure({
        props: [
            foldNodeProp.add({
                ConfigBlock(tree) { 
                    var node = tree.firstChild
                    if (node == null) return null
                    while (node.type.name != 'Body') {
                        node = node.nextSibling 
                        if (node == null) return null
                    }
                    console.log(tree.type.name, tree.firstChild?.type.name, tree.firstChild?.nextSibling?.type.name)
                    return { from: node.from -1, to: tree.to - 2 }
                },
            }),
            styleTags({
                ImportKeyword: t.keyword,
                Import: t.keyword,
                ConfigBlock: t.namespace,
                BlockType: t.namespace,

                Parameter: t.keyword,

                Identifier: t.attributeName,
                Comment: t.lineComment,
                Boolean: t.bool,
                String: t.string,
                Number: t.number,
                Cords: t.number,
                Pin: t.atom,
                VirtualPin: t.atom,
                FilePath: t.className,
                Path: t.className,
                Jinja2: t.typeName,
            }),
        ],
        wrap: parseMixed((node) => {
            return node.name == 'Jinja2' ? { parser: jinja2Parser } : null
        }),
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

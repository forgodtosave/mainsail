import { NodeType, Parser } from '@lezer/common'
import { testTree } from '@lezer/generator/dist/test'

function toLineContext(file: string, index: number) {
    const endEol = file.indexOf('\n', index + 80)

    const endIndex = endEol === -1 ? file.length : endEol

    return file
        .substring(index, endIndex)
        .split(/\n/)
        .map((str) => '  | ' + str)
        .join('\n')
}

function defaultIgnore(type: NodeType) {
    return /\W/.test(type.name)
}

export function fileTests(file: string, fileName: string, mayIgnore = defaultIgnore) {
    let caseExpr = /\s*#[ \t]*(.*)(?:\r\n|\r|\n)`([^]*?)`\n==+>([^]*?)(?:$|(?:\r\n|\r|\n)+(?=#))/gy
    let tests: {
        name: string
        text: string
        expected: string
        configStr: string
        config: object
        strict: boolean
        run(parser: Parser): void
    }[] = []
    let lastIndex = 0
    for (;;) {
        let m = caseExpr.exec(file)
        if (!m) throw new Error(`Unexpected file format in ${fileName} around\n\n${toLineContext(file, lastIndex)}`)

        let text = m[2].trim(),
            expected = m[3].trim()
        let [, name, configStr] = /(.*?)(\{.*?\})?$/.exec(m[1])!
        let config = configStr ? JSON.parse(configStr) : null
        let strict = !/⚠|\.\.\./.test(expected)

        tests.push({
            name,
            text,
            expected,
            configStr,
            config,
            strict,
            run(parser: Parser) {
                if ((parser as any).configure && (strict || config))
                    parser = (parser as any).configure({ strict, ...config })
                testTree(parser.parse(text), expected, mayIgnore)
            },
        })
        lastIndex = m.index + m[0].length
        if (lastIndex == file.length) break
    }
    return tests
}

/* var parser = require('../dist/klipperCfgParser.cjs')
var fileTests = require('@lezer/generator/dist/test')
var fs = require('fs')
var path = require('path') */
import { parser } from '../dist/klipperCfgParser.cjs'
import * as fs from 'fs'
import * as path from 'path'

import { fileTests } from './mochaFileTests.ts'

const caseDir = 'src/plugins/Codemirror/KlipperCfgLang/test'

for (let file of fs.readdirSync(caseDir)) {
    if (!/\.txt$/.test(file)) continue

    let name = /^[^\.]*/.exec(file)[0]
    describe(name, () => {
        for (let { name, run } of fileTests(fs.readFileSync(path.join(caseDir, file), 'utf8'), file))
            it(name, () => run(parser))
    })
    console.log(fileTests(fs.readFileSync(path.join(caseDir, file), 'utf8'), file))
}

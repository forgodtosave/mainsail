var parser = require('../dist/klipperCfgParser.cjs').parser
var fileTests = require('@lezer/generator/dist/test').fileTests //
var fs = require('fs')
var path = require('path')
var assert = require('assert')
/* import { parser } from '../dist/klipperCfgParser.cjs'
import * as fs from 'fs'
import * as path from 'path'
import * as assert from 'assert'
import { fileTests } from '../mochaFileTests.js' */

const caseDir = 'src/plugins/Codemirror/KlipperCfgLang/test'
const testConfigsDir = 'src/plugins/Codemirror/KlipperCfgLang/test/testConfigs'

for (let file of fs.readdirSync(caseDir)) {
    if (!/\.txt$/.test(file)) continue

    let name = /^[^\.]*/.exec(file)[0]
    describe(name, () => {
        for (let { name, run } of fileTests(fs.readFileSync(path.join(caseDir, file), 'utf8'), file))
            it(name, () => run(parser))
    })
}
 
for (let file of fs.readdirSync(testConfigsDir)) {
    let name = /^[^\.]*/.exec(file)[0]
    describe(name, () => {
        const text = fs.readFileSync(path.join(testConfigsDir, file), 'utf8')
        it('should return no ⚠ when parsed', () => {
            assert.equal(parser.parse(text).indexOf('⚠'), -1)
        })
    })
}

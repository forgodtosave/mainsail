import { klipperCfgLint } from '../lang/lint.js'
import { valueTests } from './testValues.js'

describe('Variable Types', () => {
    for (test in valueTests) {
        it(test.name, () => klipperCfgLint(test.input) === test.output)
    }
})

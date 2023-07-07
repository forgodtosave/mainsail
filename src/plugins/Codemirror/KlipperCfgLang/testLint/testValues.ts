import { LintTest } from '../../mochaFileTests'

export const valueTests: LintTest[] = []

valueTests.push({
    name: 'Value where configRefMd type any',
    input: `
[mcu]
Serial: /dev/ttyAMA0`,
    expected: [],
})

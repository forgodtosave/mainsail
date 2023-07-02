import { syntaxTree } from '@codemirror/language'
import { linter, Diagnostic } from '@codemirror/lint'
import { EditorState } from '@codemirror/state'
import { SyntaxNode } from '@lezer/common'
import { exampleText, parseConfigMd } from '../ref-parser/ref-parser'
interface Parameter {
    name: string
    value: string
    isOptional: boolean
    tooltip: string
}

// Parse Config Reference
const [mdConfigBlockMap, mdDepParamBlockMap] = parseConfigMd(exampleText)

export const klipperConfigLint = linter((view) => {
    const diagnostics: Diagnostic[] = []
    const programmNode = syntaxTree(view.state).topNode
    const importNodes = programmNode.getChildren('Import')
    // also add diagnostics for duplicate BlockTypes
    const configBlockNodes = createConfigBlockNodeMap(programmNode, view.state, diagnostics)

    // check imports
    importNodes.forEach((importNode) => {
        const pathNode = importNode.getChild('FilePath')
        if (!pathNode) {
            addToDiagnostics(diagnostics, importNode, 'Import must be a file or file path')
        }
    })

    // check all config blocks
    const printerKinematics = getPrinterKinematics(view.state, programmNode)
    const allPossibleBlockTypes = getAllPossibleBlockTypes(view.state, printerKinematics)

    configBlockNodes.forEach((configBlockNode, blockTypeIdent) => {
        const blockTypeNode = configBlockNode.getChild('BlockType')
        if (!blockTypeNode) return
        const [blockType, identifier] = blockTypeIdent.split(' ')

        // check if BlockType is valid
        if (!allPossibleBlockTypes.has(blockType)) {
            let msg = 'Invalid BlockType: ' + blockType
            const possibleAlternatives = findClosestMatches(blockType, allPossibleBlockTypes)
            if (possibleAlternatives.length > 0) {
                msg += '\nDid you mean: ' + possibleAlternatives.map((item) => `"${item}"`).join(', ') + ' ?'
            }
            msg += '\n(forther linting in this block is not possible)'
            addToDiagnostics(diagnostics, blockTypeNode, msg)
            return
        }

        // check if BlockName is given if required
        if (!identifier && mdConfigBlockMap.get(blockType)?.requiresName) {
            addToDiagnostics(diagnostics, blockTypeNode, 'Identifier required!\nLike [' + blockType + ' myName]')
        }

        // also add diagnostics for duplicate Parameters
        const usedOptions = createOptionsNodeMap(configBlockNode, view.state, diagnostics)
        if (usedOptions.size === 0) return
        const allPossibleOptions = createAllPossibleOptionsMap(blockType, usedOptions)
        if (allPossibleOptions.size === 0) return

        // check if all required options are given
        allPossibleOptions.forEach((option, parameter) => {
            if (!option.isOptional && !usedOptions.has(parameter)) {
                addToDiagnostics(diagnostics, blockTypeNode, 'Missing required Parameter: ' + parameter)
            }
        })

        usedOptions.forEach(({ paramValue, optionNode }, parameter) => {
            // check if used option is valid in this blocktype
            if (!allPossibleOptions.has(parameter)) {
                addToDiagnostics(diagnostics, optionNode, 'Invalid Parameter in this Block!')
                return
            }

            // check if used option has correct value type
        })
    })

    // if nothing else check if lezer-parser could parse the node
    syntaxTree(view.state)
        .cursor()
        .iterate((node) => {
            if (node.type.isError) {
                diagnostics.push({
                    from: node.from,
                    to: node.to,
                    severity: 'error',
                    message: 'Parse error: ' + JSON.stringify(view.state.sliceDoc(node.from, node.to)),
                })
            }
        })

    return diagnostics
})

function addToDiagnostics(diagnostics: Diagnostic[], node: SyntaxNode, message: string) {
    diagnostics.push({
        from: node.from,
        to: node.to,
        severity: 'error',
        message: message,
    })
}

function findPrinterNode(programmNode: SyntaxNode, state: EditorState) {
    const printerNode =
        programmNode.getChildren('ConfigBlock')?.find((configBlockNode) => {
            const blockTypeNode = configBlockNode.getChild('BlockType')
            if (!blockTypeNode) return false
            return state.sliceDoc(blockTypeNode.from, blockTypeNode.to) === 'printer'
        }) ?? null
    return printerNode
}

function getPrinterKinematics(state: EditorState, programmNode: SyntaxNode) {
    const printerOptions = findPrinterNode(programmNode, state)?.getChild('Body')?.getChildren('Option') ?? []
    for (const childNode of printerOptions) {
        const parameter = childNode.getChild('Parameter')
        const value = childNode.getChild('Value')
        if (!parameter || !value) continue
        const parameterName = state.sliceDoc(parameter.from, parameter.to)
        if (parameterName !== 'kinematics') continue
        const printerKinematics = state.sliceDoc(value.from, value.to).replace(/(\r\n|\n|\r)/gm, '')
        return printerKinematics.split('#')[0].trim()
    }
    return ''
}

function getAllPossibleBlockTypes(state: EditorState, printerKinematics: string) {
    let blockTypes = Array.from(mdConfigBlockMap.keys())
    // if no printerKinematics is set, no filtering (all steppers_ possible) else filter steppers_ by printerKinematics
    if (printerKinematics !== '') {
        blockTypes = blockTypes.filter(
            (blockType) => !blockType.includes('stepper_') || blockType.includes('--' + printerKinematics)
        )
    }
    blockTypes = blockTypes.map((blockType) => (blockType.includes('--') ? blockType.split('-')[0] : blockType))
    return new Set(blockTypes)
}

function createConfigBlockNodeMap(programmNode: SyntaxNode, state: EditorState, diagnostics: Diagnostic[]) {
    const configBlockNodes = programmNode.getChildren('ConfigBlock')
    const configBlockNodeMap = new Map<string, SyntaxNode>()
    configBlockNodes.forEach((configBlockNode) => {
        const blockTypeNode = configBlockNode.getChild('BlockType')
        if (!blockTypeNode) return
        const blockType = state.sliceDoc(blockTypeNode.from, blockTypeNode.to)

        const identifierNode = configBlockNode.getChild('Identifier')
        const identifierName = identifierNode ? state.sliceDoc(identifierNode.from, identifierNode.to).trim() : ''

        const mapKey = blockType + ' ' + identifierName
        if (configBlockNodeMap.has(mapKey)) addToDiagnostics(diagnostics, blockTypeNode, 'Duplicate BlockType')
        else configBlockNodeMap.set(mapKey, configBlockNode)
    })
    return configBlockNodeMap
}

function findClosestMatches(input: string, set: Set<string>): string[] {
    const matches = []
    let minErrors = Infinity

    for (const str of set) {
        const errors = calculateErrors(input, str)
        if (errors <= minErrors) {
            minErrors = errors
            if (errors === 0) {
                matches.unshift(str) // Add exact matches at the beginning
            } else {
                matches.push(str) // Add other matches at the end
            }
        }
    }
    return matches
}

function calculateErrors(str1: string, str2: string): number {
    const len1 = str1.length
    const len2 = str2.length
    const dp: number[][] = []
    for (let i = 0; i <= len1; i++) {
        dp[i] = []
        dp[i][0] = i
    }
    for (let j = 0; j <= len2; j++) {
        dp[0][j] = j
    }
    for (let i = 1; i <= len1; i++) {
        for (let j = 1; j <= len2; j++) {
            const cost = str1[i - 1] === str2[j - 1] ? 0 : 1
            dp[i][j] = Math.min(dp[i - 1][j] + 1, dp[i][j - 1] + 1, dp[i - 1][j - 1] + cost)
        }
    }
    return dp[len1][len2]
}

function createOptionsNodeMap(configBlockNode: SyntaxNode, state: EditorState, diagnostics: Diagnostic[]) {
    const optionsNodeMap = new Map<string, { paramValue: string; optionNode: SyntaxNode }>()
    const optionNodes = configBlockNode.getChild('Body')?.getChildren('Option') ?? []
    if (!optionNodes) return optionsNodeMap
    optionNodes.forEach((optionNode) => {
        const parameterNode = optionNode.getChild('Parameter')
        if (!parameterNode) return
        const parameter = state.sliceDoc(parameterNode.from, parameterNode.to).trim()
        const valueNode = optionNode.getChild('Value')
        const value = valueNode ? state.sliceDoc(valueNode.from, valueNode.to).trim() : ''
        const paramValue = parameter + ':' + value
        if (optionsNodeMap.has(parameter)) addToDiagnostics(diagnostics, parameterNode, 'Duplicate Parameter')
        else optionsNodeMap.set(parameter, { paramValue, optionNode })
    })
    return optionsNodeMap
}

function createAllPossibleOptionsMap(
    blockType: string,
    usedOptions: Map<string, { paramValue: string; optionNode: SyntaxNode }>
) {
    const allPossibleOptions = new Map<string, Parameter>()
    const blockTypeOptions = mdConfigBlockMap.get(blockType)?.parameters ?? []
    blockTypeOptions.forEach((parameter) => {
        allPossibleOptions.set(parameter.name, parameter)
    })
    usedOptions.forEach(({ paramValue }) => {
        const depParams = mdDepParamBlockMap.get(paramValue)
        if (depParams) {
            depParams.parameters.forEach((parameter) => {
                allPossibleOptions.set(parameter.name, parameter)
            })
        }
    })

    return allPossibleOptions
}

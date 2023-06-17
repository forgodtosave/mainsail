import { syntaxTree } from '@codemirror/language'
import { linter, Diagnostic } from '@codemirror/lint'
import { EditorState } from '@codemirror/state'
import { SyntaxNode } from '@lezer/common'
import { exampleText, parseConfigMd, printConfigMd } from '../ref-parser/ref-parser'

// Parse Config Reference
const [mdConfigBlockMap, mdParamBlockMap] = parseConfigMd(exampleText)

export const klipperConfigLint = linter((view) => {
    const diagnostics: Diagnostic[] = []
    const programmNode = syntaxTree(view.state).topNode
    const importNodes = programmNode.getChildren('Import')
    const configBlockNodes = createConfigBlockNodeMap(programmNode, view.state)

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
        const [blockType, identifier, duplicate] = blockTypeIdent.split(' ')

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
            addToDiagnostics(diagnostics, blockTypeNode, 'Identifier required for ' + blockType)
        }

        //check if duplicate
        if (duplicate) {
            if (identifier) {
                const idnetifierNode = configBlockNode.getChild('Identifier') ?? blockTypeNode
                addToDiagnostics(diagnostics, idnetifierNode, 'Duplicate Identifier')
            } else {
                addToDiagnostics(diagnostics, blockTypeNode, 'Duplicate BlockType')
            }
        }

        const usedOptions = new Map<string, SyntaxNode>()
        // check if options are valid in this blocktype

        // check if all required options are given

        // check if all options have valid values
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

function getOptionsByBlockType(blocktype: string, state: EditorState, parentNode: SyntaxNode) {
    let options: { label: string; type: string; info: string }[] = []
    const printerKinematics = getPrinterKinematics(state, parentNode)
    if (blocktype.includes('stepper_')) {
        1
        const stepperOptions = autocompletionMap.get(blocktype + '--' + printerKinematics)
        const secondaryStepperOptions = /\d/.test(blocktype)
            ? autocompletionMap.get('stepper_z1')
            : autocompletionMap.get('stepper_x')
        if (stepperOptions) {
            options.push(...stepperOptions)
        }
        if (secondaryStepperOptions) {
            options.push(...secondaryStepperOptions)
        }
    } else {
        const optionsForBlockType =
            autocompletionMap.get(blocktype) || autocompletionMap.get(blocktype + '--' + printerKinematics)
        if (optionsForBlockType) {
            options.push(...optionsForBlockType)
        }
    }
    if (blocktype.includes('extruder') && /\d/.test(blocktype)) {
        const secondaryExtruderOptions = autocompletionMap.get('extruder1')
        if (secondaryExtruderOptions) {
            options.push(...secondaryExtruderOptions)
        }
    }
    return editOptions(options, state, parentNode)
}

function editOptions(options: { label: string; type: string; info: string }[], state: EditorState, node: SyntaxNode) {
    const allreadyUsedOptions = new Set<string>()
    // for all options in the current config block check if it is a trigger parameters and add dependent parameters if necessary
    for (const childNode of node.parent?.parent?.getChildren('Option') ?? []) {
        const parameter = childNode.firstChild
        const value = childNode.lastChild
        if (!parameter || !value) continue
        const parameterName = state.sliceDoc(parameter.from, parameter.to).trim()
        if (!parameterName.endsWith('_')) allreadyUsedOptions.add(parameterName) // save allready used options to remove them later (not "variable_")
        const valueName = state.sliceDoc(value.from, value.to).replace(/(\r\n|\n|\r)/gm, '')
        const parameterValue = valueName !== '' ? parameterName + ':' + valueName : parameterName
        const mapEntry = dependentParametersMap.get(parameterValue)
        if (mapEntry) {
            options = options.concat(mapEntry)
        }
    }
    // remove all options that are already used in the current config block
    return (options = options.filter((option) => !allreadyUsedOptions.has(option.label.replace(': ', ''))))
}

function getAllPossibleBlockTypes(state: EditorState, printerKinematics: String) {
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

function createConfigBlockNodeMap(programmNode: SyntaxNode, state: EditorState) {
    const configBlockNodes = programmNode.getChildren('ConfigBlock')
    const configBlockNodeMap = new Map<string, SyntaxNode>()
    configBlockNodes.forEach((configBlockNode) => {
        const blockTypeNode = configBlockNode.getChild('BlockType')
        if (!blockTypeNode) return
        const blockType = state.sliceDoc(blockTypeNode.from, blockTypeNode.to)

        const identifierNode = configBlockNode.getChild('Identifier')
        const identifierName = identifierNode ? state.sliceDoc(identifierNode.from, identifierNode.to).trim() : ''

        let mapKey = blockType + (identifierName !== '' ? ' ' + identifierName : ' ')
        if (configBlockNodeMap.has(mapKey)) mapKey += ' duplicate'
        while (configBlockNodeMap.has(mapKey)) {
            mapKey += '-'
        }

        configBlockNodeMap.set(mapKey, configBlockNode)
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

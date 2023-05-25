import { syntaxTree } from '@codemirror/language'
import { linter, Diagnostic } from '@codemirror/lint'

export const klipperConfigLint = linter((view) => {
    let diagnostics: Diagnostic[] = []
    syntaxTree(view.state)
        .cursor()
        .iterate((node) => {
            if (node.name == '') {
                diagnostics.push({
                    from: node.from,
                    to: node.to,
                    severity: 'warning',
                    message: 'Numbers are bad',
                    actions: [
                        {
                            name: 'Remove',
                            apply(view, from, to) {
                                view.dispatch({ changes: { from, to } })
                            },
                        },
                    ],
                })
            } else {
                if (node.type.isError && !view.state.sliceDoc(node.from, node.to).includes('\n')) {
                    diagnostics.push({
                        from: node.from,
                        to: node.to,
                        severity: 'error',
                        message: 'Syntax error:\n ' + view.state.sliceDoc(node.from, node.to),
                    })
                }
            }
        })
    return diagnostics
})

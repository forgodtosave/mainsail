import {syntaxTree} from "@codemirror/language"
import {linter, Diagnostic} from "@codemirror/lint"

export const klipperConfigLint = linter(view => {
  let diagnostics: Diagnostic[] = []
  syntaxTree(view.state).cursor().iterate(node => {
    if (node.name == "Number") diagnostics.push({
      from: node.from,
      to: node.to,
      severity: "warning",
      message: "Numbers are bad",
      actions: [{
        name: "Remove",
        apply(view, from, to) { view.dispatch({changes: {from, to}}) }
      }]
    })
  })
  return diagnostics
})



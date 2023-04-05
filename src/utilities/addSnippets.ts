import { SnippetString } from "vscode";
const elementSnippets = require('../../config/element-snippets.json')

export default function addSnippets(name) {
  const data = elementSnippets[name]
  if (!data) {
    return new SnippetString('')
  }
  return new SnippetString(data.body.join('\n'))
}

export const ElementKeys = Object.keys(elementSnippets)
  .reduce((pre,next) => {
    pre[next] = true
    return pre
  }, {})
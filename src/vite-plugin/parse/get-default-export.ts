import { ParsedStoriesResult } from "../../app/src/types.js"
import { converter } from "../babel/ast-to-obj.js"

export function getDefaultExport(result: ParsedStoriesResult, astPath: any) {
  if (!astPath) {
    return
  }

  try {
    let objNode = astPath.node.declaration

    if (astPath.node.declaration.type === "Identifier") {
      objNode = astPath.scope.bindings[astPath.node.declaration.name].path.node.init
    }

    if (["TSAsExpression", "TSSatisfiesExpression"].includes(astPath.node.declaration.type)) {
      objNode = astPath.node.declaration.expression
    }

    for (const prop of objNode?.properties || []) {
      if (prop.type === "ObjectProperty" && prop.key.name === "title") {
        if (prop.value.type !== "StringLiteral") {
          throw new Error("Default title must be a string literal.")
        }

        result.exportDefaultProps.title = prop.value.value
      } else if (prop.type === "ObjectProperty" && prop.key.type === "Identifier" && prop.key.name === "meta") {
        const json = JSON.stringify(converter(prop.value))
        result.exportDefaultProps.meta = JSON.parse(json)
      }
    }
  } catch (e) {
    throw new Error(
      `Can't parse the default title and meta of ${result.entry}. Meta must be serializable and title a string literal.`
    )
  }
}

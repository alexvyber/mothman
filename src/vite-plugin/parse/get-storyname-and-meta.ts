import { ParsedStoriesResult } from "../../app/src/types.js"
import { converter } from "../babel/ast-to-obj.js"

export function getStorynameAndMeta(result: ParsedStoriesResult, astPath: any) {
  for (const child of astPath.node.body) {
    if (!(child.type === "ExpressionStatement" && child.expression.left && child.expression.left.property)) {
      continue
    }

    if (child.expression.left.property.name === "storyName") {
      const storyExport = child.expression.left.object.name

      if (child.expression.right.type !== "StringLiteral") {
        throw new Error(`${storyExport}.storyName in ${result.entry} must be a string literal.`)
      }

      result.namedExportToStoryName[storyExport] = child.expression.right.value
    } else if (child.expression.left.property.name === "meta") {
      const storyExport = child.expression.left.object.name

      if (child.expression.right.type !== "ObjectExpression") {
        throw new Error(`${storyExport}.meta in ${result.entry} must be an object expression.`)
      }

      try {
        const json = JSON.stringify(converter(child.expression.right))
        result.namedExportToMeta[storyExport] = JSON.parse(json)
      } catch (e) {
        throw new Error(`${storyExport}.meta in ${result.entry} must be serializable.`)
      }
    }
  }
}

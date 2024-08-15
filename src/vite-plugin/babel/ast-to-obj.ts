// adapt from:
// nd-02110114/babel-plugin-object-to-json-parse
// https://github.com/nd-02110114/babel-plugin-object-to-json-parse/blob/master/src/utils.ts

import t from "@babel/types"

function isValidJsonValue(node: t.Node | null | undefined): boolean {
  return (
    t.isNumericLiteral(node) ||
    t.isStringLiteral(node) ||
    t.isBooleanLiteral(node) ||
    t.isNullLiteral(node) ||
    t.isArrayExpression(node) ||
    t.isObjectExpression(node)
  )
}

function isObjectExpressionWithOnlyObjectProperties(node: t.ObjectExpression): boolean {
  return node.properties.every((property) => t.isObjectProperty(property))
}

function isConvertibleObjectProperty(properties: t.ObjectProperty[]): boolean {
  return properties.every((node) => !node.computed)
}

function createSafeStringForJsonParse(value: string): string {
  if (/\\/.test(value)) {
    value = value.replace(/\\/g, "\\\\")
  }

  if (/"/.test(value)) {
    value = value.replace(/"/g, '\\"')
  }

  if (/[\t\f\r\n\b]/g.test(value)) {
    const codes = ["\f", "\r", "\n", "\t", "\b"]
    const replaceCodes = ["\\f", "\\r", "\\n", "\\t", "\\b"]

    for (let i = 0; i < codes.length; i++) {
      value = value.replace(new RegExp(codes[i], "g"), replaceCodes[i])
    }
  }

  return value
}

export function converter(node: t.Node | null | undefined): any {
  // for negative number, ex) -10
  if (t.isUnaryExpression(node)) {
    if (node.operator === "-" && t.isNumericLiteral(node.argument)) {
      return -node.argument.value
    }
  }

  if (!isValidJsonValue(node)) {
    throw new Error("Invalid value is included.")
  }

  if (t.isStringLiteral(node)) {
    return createSafeStringForJsonParse(node.value)
  }

  if (t.isNullLiteral(node)) {
    return null
  }

  if (t.isArrayExpression(node)) {
    return node.elements.map((node) => converter(node))
  }

  if (t.isObjectExpression(node)) {
    if (!isObjectExpressionWithOnlyObjectProperties(node)) {
      throw new Error("Invalid syntax is included.")
    }

    // @ts-expect-error
    if (!isConvertibleObjectProperty(node.properties)) {
      throw new Error("Invalid syntax is included.")
    }

    const properties = {} as Record<string, any>
    for (const property of node.properties) {
      // @ts-expect-error
      let key = property.key.name || property.key.value

      if (typeof key === "string") {
        key = createSafeStringForJsonParse(key)
      }

      if (typeof key === "number" && !Number.isSafeInteger(key)) throw new Error("Invalid syntax is included.")

      // @ts-expect-error
      Object.assign(properties, { [key]: converter(property.value) })
    }

    return properties
  }

  // @ts-expect-error
  return node.value
}

import { codeFrameColumns } from "@babel/code-frame"
import { parse, ParseResult, ParserPlugin } from "@babel/parser"
import { getErrorMessage } from "../../shared/get-error-message"
import { logger } from "../../shared/logger"

const plugins: ParserPlugin[] = [
  "jsx",
  "asyncGenerators",
  "classProperties",
  "classPrivateProperties",
  "classPrivateMethods",
  ["decorators", { decoratorsBeforeExport: true }],
  "doExpressions",
  "dynamicImport",
  "exportDefaultFrom",
  "exportNamespaceFrom",
  "functionBind",
  "functionSent",
  "importMeta",
  "logicalAssignment",
  "nullishCoalescingOperator",
  "numericSeparator",
  "objectRestSpread",
  "optionalCatchBinding",
  "optionalChaining",
  "partialApplication",
  "throwExpressions",
  "topLevelAwait",
]

export function getAst(code: string, filename: string): ParseResult<ParseResult<any>> {
  try {
    return parse(code, {
      sourceType: "module",
      plugins: [...plugins, filename.endsWith(".ts") || filename.endsWith(".tsx") ? "typescript" : "flow"],
    })
  } catch (error) {
    logger.error(`${getErrorMessage(error)} in ${filename}`)
    logger.debug(
      codeFrameColumns(
        code,
        // @ts-expect-error
        { start: error?.loc },
        { highlightCode: true }
      )
    )

    throw error
  }
}

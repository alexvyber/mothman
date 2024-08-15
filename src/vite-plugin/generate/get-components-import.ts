import { existsSync, readFileSync } from "node:fs"
import { basename, join } from "node:path"

import { logger } from "../../shared/logger.js"
import { traverse } from "../babel/babel.js"
import { getAst } from "../babel/get-ast.js"

export function getComponentsImport(configFolder: string) {
  const defaultArgs = "export const args = {};\n"
  const defaultArgTypes = "export const argTypes = {};\n"
  const defaultStorySourceHeader = `export const StorySourceHeader = ({ path }) => /*#__PURE__*/createElement('div', { style: { paddingTop: "2em" }}, /*#__PURE__*/createElement('code', { className: "moth-code" }, path));\n`
  const defaultProvider =
    "export const Provider = ({children}) => /*#__PURE__*/createElement(Fragment, null, children);\n"

  const componentsPaths = [
    join(configFolder, "components.tsx"),
    join(configFolder, "components.ts"),
    join(configFolder, "components.jsx"),
    join(configFolder, "components.js"),
  ]

  const firstFoundComponentsPath = componentsPaths.find((componentsPath) => existsSync(componentsPath))

  if (!firstFoundComponentsPath) {
    logger.debug("Custom components.{tsx,ts,jsx,js} not found.")
    return `${defaultProvider}${defaultStorySourceHeader}${defaultArgs}${defaultArgTypes}`
  }

  const sourceCode = readFileSync(firstFoundComponentsPath, "utf8")
  const filename = basename(firstFoundComponentsPath)

  firstFoundComponentsPath && logger.debug(`${configFolder}/${filename} found.`)

  const isProvider = checkIfNamedExportExists("Provider", sourceCode, filename)
  const isStorySourceHeader = checkIfNamedExportExists("StorySourceHeader", sourceCode, filename)
  const isArgs = checkIfNamedExportExists("args", sourceCode, filename)
  const isArgTypes = checkIfNamedExportExists("argTypes", sourceCode, filename)

  if (!(isStorySourceHeader || isProvider || isArgs || isArgTypes)) {
    return `import '${join(configFolder, filename)}';\n${defaultProvider}${defaultStorySourceHeader}${defaultArgs}${defaultArgTypes}`
  }

  let output = ""
  const componentsPath = join(configFolder, filename)

  if (isProvider) {
    logger.debug("Custom Provider found.")
    output += `export { Provider } from '${componentsPath}';\n`
  } else {
    logger.debug("Custom Provider not found. Returning the default.")
    output += defaultProvider
  }

  if (isStorySourceHeader) {
    logger.debug("Custom StorySourceHeader found.")
    output += `export { StorySourceHeader } from '${componentsPath}';\n`
  } else {
    logger.debug("Custom StorySourceHeader not found. Returning the default.")
    output += defaultStorySourceHeader
  }

  if (isArgs) {
    logger.debug("Global args found.")
    output += `export { args } from '${componentsPath}';\n`
  } else {
    logger.debug("Global args not found.")
    output += defaultArgs
  }

  if (isArgTypes) {
    logger.debug("Global argTypes found.")
    output += `export { argTypes } from '${componentsPath}';\n`
  } else {
    logger.debug("Global argTypes not found.")
    output += defaultArgTypes
  }

  return output
}

function checkIfNamedExportExists(namedExport: string, sourceCode: string, filename: string) {
  let exists = false

  const ast = getAst(sourceCode, filename)

  traverse(ast, {
    ExportNamedDeclaration: (astPath: any) => {
      if (astPath.node.declaration.declarations[0].id.name === namedExport) {
        exists = true
      }
    },
  })

  return exists
}

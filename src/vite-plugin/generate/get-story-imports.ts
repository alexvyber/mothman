import { join } from "node:path"

import t from "@babel/types"
import { EntryData } from "../../app/src/types.js"
import { generate, template } from "../babel/babel.js"

const IMPORT_ROOT = process.env.IMPORT_ROOT || process.cwd()

export function getStoryImports(entryData: EntryData) {
  let storyImports = `
    import { lazy, createElement, Fragment } from "react";
    import composeEnhancers from "/react-utils/compose-enhancers";\n`

  const lazyImport = template(`
    const %%component%% = lazy(() =>
     import(%%source%%).then((module) => {
        return { default: composeEnhancers(module, %%story%%) };
      })
    );
  `)

  for (const [entryKey, entry] of Object.entries(entryData)) {
    for (const { componentName, namedExport } of entry.stories) {
      const ast = lazyImport({
        source: t.stringLiteral(join(IMPORT_ROOT, entryKey)),
        component: t.identifier(componentName),
        story: t.stringLiteral(namedExport),
      })

      if (Array.isArray(ast)) {
        for (const node of ast) {
          storyImports += `\n${generate(node).code}`
        }
      } else {
        storyImports += `\n${generate(ast).code}`
      }
    }
  }

  return storyImports
}

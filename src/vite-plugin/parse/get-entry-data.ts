import { readFile } from "node:fs/promises"
import { join } from "node:path"

import { EntryData, ParsedStoriesResult } from "../../app/src/types.js"
import { logger } from "../../shared/logger.js"
import { traverse } from "../babel/babel.js"
import { getAst } from "../babel/get-ast.js"
import { getFileId } from "../utils.js"
import { getDefaultExport } from "./get-default-export.js"
import { getNamedExports } from "./get-named-exports.js"
import { getStorynameAndMeta } from "./get-storyname-and-meta.js"

const IMPORT_ROOT = process.env.IMPORT_ROOT || process.cwd()

export async function getEntryData(entries: string[]) {
  const entryData = {} as EntryData

  entries.sort()

  for (const entry of entries) {
    logger.debug(`Parsing entry: ${entry}`)
    Object.assign(entryData, { [entry]: await getSingleEntry(entry) })
  }

  return entryData
}

export const getSingleEntry = async (entry: string) => {
  const code = await readFile(join(IMPORT_ROOT, entry), "utf8")

  const result: ParsedStoriesResult = {
    entry,
    stories: [],
    exportDefaultProps: { title: undefined, meta: undefined },
    namedExportToMeta: {},
    namedExportToStoryName: {},
    storyParams: {},
    storySource: code.replace(/\r/g, ""),
    fileId: getFileId(entry),
  }

  const ast = getAst(code, entry)

  traverse(ast, { Program: getStorynameAndMeta.bind(this, result) })

  traverse(ast, { ExportDefaultDeclaration: getDefaultExport.bind(this, result) })

  traverse(ast, { ExportNamedDeclaration: getNamedExports.bind(this, result) })

  logger.debug(`Parsed data for entry: ${entry}`)

  // make story order deterministic
  result.stories.sort(({ storyId: idA }, { storyId: idB }) => (idA < idB ? -1 : idA > idB ? 1 : 0))

  logger.debug("Sorted stories for entry:", result)

  return result
}

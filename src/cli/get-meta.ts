import { globby } from "globby"

import { getMetaJson } from "../vite-plugin/generate/get-meta-json.js"
import { getEntryData } from "../vite-plugin/parse/get-entry-data.js"
import { applyCLIConfig } from "./apply-cli-config.js"

export async function getMeta(params = {}) {
  const { config } = await applyCLIConfig(params)

  const stories = await globby(Array.isArray(config.stories) ? config.stories : [config.stories])
  const entryData = await getEntryData(stories)

  return getMetaJson(entryData)
}

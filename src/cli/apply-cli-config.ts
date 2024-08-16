import { isAbsolute, join } from "node:path"
import { mergeDeep } from "remeda"

import { CLIParams, Config } from "../app/src/types.js"
import { logger } from "../shared/logger.js"
import { loadMothConfig } from "./load-moth-config.js"

export async function applyCLIConfig(cliParams: CLIParams) {
  logger.debug(`CLI theme: ${cliParams.theme}`)
  logger.debug(`CLI stories: ${cliParams.stories}`)
  logger.debug(`CLI host: ${cliParams.host || "undefined"}`)
  logger.debug(`CLI port: ${cliParams.port || "undefined"}`)
  logger.debug(`CLI out: ${cliParams.outDir || "undefined"}`)

  const configName = cliParams.config || ".moth"
  const configFolder = isAbsolute(configName) ? configName : join(process.cwd(), configName)
  const config = await loadMothConfig(configFolder)

  if (cliParams.theme) {
    config.addons.theme.defaultState = cliParams.theme
    cliParams.theme = undefined
  }

  const merged = mergeDeep(config, cliParams) as Config
  logger.debug(`final config: ${JSON.stringify(merged, null, 2)}`)

  process.env.VITE_PUBLIC_MTH_THEME = merged.addons.theme.defaultState

  return { configFolder, config: merged }
}

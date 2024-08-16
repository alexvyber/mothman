import { join } from "node:path"
import { mergeDeep } from "remeda"

import { Config, UserConfig } from "../app/src/types.js"
import { defaultConfig as config_ } from "../shared/default-config.js"
import { getErrorMessage } from "../shared/get-error-message.js"
import { logger } from "../shared/logger.js"

export async function loadMothConfig(configFolder: string): Promise<Config> {
  const defaultConfig = { ...config_ }

  try {
    const config: UserConfig = (await import(join(configFolder, "config.ts"))).default

    if (Object.keys(config).length === 0) {
      logger.warn("Custom config is empty")
    } else {
      logger.debug(`Custom config found: ${JSON.stringify(config, null, "  ")}`)
    }

    // don't merge default width options
    if (config?.addons?.width?.options) {
      defaultConfig.addons.width.options = {}
    }

    const mergedConfig = mergeDeep(defaultConfig, config) as Config

    // don't merge hotkeys
    Object.assign(mergedConfig, { hotkeys: { ...mergedConfig.hotkeys, ...config.hotkeys } })

    return mergedConfig
  } catch (error) {
    logger.error(`Error loading config: ${getErrorMessage(error)}`)
    logger.debug("Using default config")
    return defaultConfig
  }
}

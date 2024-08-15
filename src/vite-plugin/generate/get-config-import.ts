import { join } from "node:path"
import { merge } from "remeda"

import { Config } from "../../app/src/types"
import { getErrorMessage } from "../../shared/get-error-message"
import { logger } from "../../shared/logger"

export async function getConfigImport(configFolder: string, config: Config) {
  let configCode = "export let config = {};\n"
  const clientConfig = {} as Config

  try {
    const mothConfig = await import(join(process.cwd(), configFolder, "config.ts"))
    Object.assign(clientConfig, adjustMothConfig(mothConfig))
  } catch (error) {
    logger.warn(getErrorMessage(error))
  }

  merge(clientConfig, adjustMothConfig(config))

  // don't merge hotkeys
  clientConfig.hotkeys = { ...clientConfig.hotkeys, ...config.hotkeys }

  try {
    configCode = `export let config = ${JSON.stringify(clientConfig)};\n`
  } catch (error) {
    logger.error("stories, addons, defaultStory, base, mode and storyOrder must be serializable.")
    logger.error(getErrorMessage(error))
    process.exit(1)
  }

  return configCode
}

function adjustMothConfig(config: Config) {
  const clientConfig = {
    ...(config.stories ? { stories: config.stories } : {}),
    ...(config.addons ? { addons: config.addons } : {}),
    ...(config.hotkeys ? { hotkeys: config.hotkeys } : {}),
    ...(config.defaultStory ? { defaultStory: config.defaultStory } : {}),
    ...(config.base ? { base: config.base } : {}),
    ...(config.mode ? { mode: config.mode } : {}),
    ...(config.i18n ? { i18n: config.i18n } : {}),
  }

  const storyOrder = config.storyOrder
    ? Array.isArray(config.storyOrder)
      ? config.storyOrder
      : config.storyOrder.toString()
    : undefined

  if (storyOrder) Object.assign(clientConfig, { storyOrder })

  return clientConfig
}

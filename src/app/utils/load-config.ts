import { merge } from "remeda"
import { Stories } from "virtual:stories"

import { defaultConfig as config_ } from "../../shared/default-config"
import { logger } from "../../shared/logger"
import { Config } from "../src/types"
import { sortStories } from "./story-name"

const config = {} as Config
const stories = {} as Stories

const defaultConfig = { ...config_ }

if (Object.keys(config).length === 0) {
  logger.debug("No custom config found.")
} else {
  if (config.storyOrder && typeof config.storyOrder === "string") {
    config.storyOrder = new Function(`return ${config.storyOrder}`)()
  }

  logger.debug("Custom config found:")
  logger.debug(config)
}

// don't merge default width options
if (config?.addons?.width?.options) {
  defaultConfig.addons.width.options = {}
}

const mergedConfig: Config = merge(defaultConfig, config)
if (mergedConfig.defaultStory === "") {
  mergedConfig.defaultStory = sortStories(Object.keys(stories), mergedConfig.storyOrder)[0] || ""
}

// don't merge hotkeys
mergedConfig.hotkeys = { ...mergedConfig.hotkeys, ...config.hotkeys }

logger.debug("Final config", mergedConfig)

export default mergedConfig

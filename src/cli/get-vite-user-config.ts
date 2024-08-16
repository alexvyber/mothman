// vite.config.js paths are relative to the project root
// but for moth, the root is in a different package, so
// we just magically fix it for the user
// users can should use absolute paths in the config to be safe

import { isAbsolute, join } from "node:path"
import { loadConfigFromFile, Plugin, UserConfig } from "vite"

import { GetUserViteConfig } from "../app/src/types"
import { logger } from "../shared/logger"

export async function getViteUserConfig(
  command: "build" | "serve",
  mode: string,
  viteConfig: string | undefined
): Promise<GetUserViteConfig> {
  const userViteConfig = await loadConfigFromFile({ command, mode }, viteConfig).then((loaded) => loaded?.config)

  if (!userViteConfig) {
    return {
      userViteConfig: {},
      hasReactPlugin: false,
      hasReactSwcPlugin: false,
      hasTSConfigPathPlugin: false,
    }
  }

  logger.debug("user vite config loaded:")
  logger.debug(userViteConfig)

  if (userViteConfig.publicDir) {
    userViteConfig.publicDir = getPublicDir(userViteConfig.publicDir)
  }

  if (userViteConfig.cacheDir) {
    userViteConfig.cacheDir = getCacheDir(userViteConfig.cacheDir)
  }

  // detect if user's config has react and TS Config plugins
  // so we can't avoid adding them through our defaults again
  const hasReactPlugin = hasPlugin(userViteConfig, "vite:react-babel")
  const hasReactSwcPlugin = hasPlugin(userViteConfig, "vite:react-swc")
  const hasTSConfigPathPlugin = hasPlugin(userViteConfig, "vite:tsconfig-paths")

  return {
    userViteConfig,
    hasReactPlugin,
    hasReactSwcPlugin,
    hasTSConfigPathPlugin,
  }
}

function hasPlugin(config: UserConfig, pluginName: string): boolean {
  let hasPlugin = false
  if (config.plugins) {
    for (const plugin of config.plugins as Plugin<any>[]) {
      if (Array.isArray(plugin) && plugin.some((item) => item?.name && item.name === pluginName)) {
        hasPlugin = true
      } else if (plugin?.name && plugin.name === pluginName) {
        hasPlugin = true
      }
    }
  }
  return hasPlugin
}

function getPublicDir(publicDir: string | false): string | false {
  if (!publicDir) {
    return false
  }

  if (isAbsolute(publicDir)) {
    return publicDir
  }

  return join(process.cwd(), publicDir || "public")
}

function getCacheDir(cacheDir: string | undefined): string {
  if (!cacheDir) {
    return join(process.cwd(), "node_modules/.vite")
  }

  if (isAbsolute(cacheDir)) {
    return cacheDir
  }

  return join(process.cwd(), cacheDir)
}

import { join } from "node:path"
import { globby } from "globby"
import { InlineConfig } from "vite"
import Inspect from "vite-plugin-inspect"
import tsconfigPaths from "vite-tsconfig-paths"

import reactSWC from "@vitejs/plugin-react-swc"
import { Config } from "../app/src/types.js"
import { getAppRoot } from "../shared/get-app-root.js"
import { logger } from "../shared/logger.js"
import { mothmanPlugin } from "../vite-plugin/plugin.js"
import { copyMswWorker } from "./copy-msw-worker.js"
import { getViteUserConfig } from "./get-vite-user-config.js"
import { mergeViteConfigs } from "./merge-vite-configs.js"

export async function getViteBaseConfig(mothmanConfig: Config, viteConfig: InlineConfig, configFolder: string) {
  const { userViteConfig, hasReactPlugin, hasReactSwcPlugin, hasTSConfigPathPlugin } = await getViteUserConfig(
    viteConfig.build ? "build" : "serve",
    viteConfig.mode || "production",
    mothmanConfig.viteConfig
  )

  logger.debug("User provided @vite/plugin-react: %s", hasReactPlugin)
  logger.debug("User provided @vite/plugin-react-swc: %s", hasReactSwcPlugin)

  const resolve = {} as { alias: any }

  if (Array.isArray(userViteConfig.resolve?.alias)) {
    resolve.alias = [
      {
        find: "msw/browser",
        replacement: mothmanConfig.addons.msw.enabled ? "msw/browser" : join(import.meta.dirname, "./empty-module.js"),
      },
      {
        find: "msw",
        replacement: mothmanConfig.addons.msw.enabled ? "msw" : join(import.meta.dirname, "./empty-module.js"),
      },
      {
        find: "axe-core",
        replacement: mothmanConfig.addons.a11y.enabled ? "axe-core" : join(import.meta.dirname, "./empty-module.js"),
      },
    ]
  } else {
    resolve.alias = {
      "msw/browser": mothmanConfig.addons.msw.enabled ? "msw/browser" : join(import.meta.dirname, "./empty-module.js"),
      msw: mothmanConfig.addons.msw.enabled ? "msw" : join(import.meta.dirname, "./empty-module.js"),
      "axe-core": mothmanConfig.addons.a11y.enabled ? "axe-core" : join(import.meta.dirname, "./empty-module.js"),
    }
  }

  const stories = Array.isArray(mothmanConfig.stories) ? mothmanConfig.stories : [mothmanConfig.stories]
  const storyEntries = [] as string[]

  for (const story of await globby(stories)) {
    storyEntries.push(join(process.cwd(), story))
  }

  const config: InlineConfig = {
    ...viteConfig,

    resolve,

    base: mothmanConfig.base,
    configFile: false,

    cacheDir: userViteConfig.cacheDir ? userViteConfig.cacheDir : join(process.cwd(), "node_modules/.vite"),
    root: getAppRoot(),
    css: { postcss: userViteConfig.css?.postcss ? userViteConfig.css.postcss : process.cwd() },
    envDir: userViteConfig.envDir ? userViteConfig.envDir : process.cwd(),

    publicDir:
      typeof userViteConfig.publicDir === "undefined" ? join(process.cwd(), "public") : userViteConfig.publicDir,

    optimizeDeps: {
      include: [
        "react",
        "react-dom",
        "react-dom/client",
        "react-hotkeys-hook",
        "react/jsx-runtime",
        "react/jsx-dev-runtime",
        "react-inspector",
        "history",
        "pino",
        "query-string",
        "prism-react-renderer",
        "@mdx-js/react",

        ...(mothmanConfig.addons.a11y.enabled ? ["axe-core"] : []),
        ...(mothmanConfig.addons.msw.enabled ? ["msw"] : []),
        ...(mothmanConfig.addons.msw.enabled ? ["msw/browser"] : []),
        ...(resolve.alias ? [] : ["react-dom/client"]),
      ],

      entries: [
        join(process.cwd(), ".moth/components.js"),
        join(process.cwd(), ".moth/components.jsx"),
        join(process.cwd(), ".moth/components.tsx"),
        join(process.cwd(), ".moth/components.ts"),
      ].concat(storyEntries),
    },

    plugins: [
      // TODO: remove inspect
      Inspect(),
      mothmanPlugin(mothmanConfig, configFolder, viteConfig.mode || "serve"),
      !(hasTSConfigPathPlugin || process.versions.pnp) && tsconfigPaths({ root: process.cwd() }),
      !(hasReactPlugin || hasReactSwcPlugin) && reactSWC(),
    ].filter(Boolean),
  }

  // initialize msw worker
  if (mothmanConfig.addons.msw.enabled) {
    copyMswWorker(config.publicDir || "")
  }

  return mergeViteConfigs(userViteConfig, config)
}

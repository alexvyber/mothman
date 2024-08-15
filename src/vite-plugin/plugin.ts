import { existsSync, readFileSync } from "node:fs"
import { join } from "node:path"
import { globby } from "globby"
import { PluginOption } from "vite"

import { Config, EntryData, StoryEntry } from "../app/src/types.js"
import { VIRTUAL_MODULE_ID } from "../const.js"
import { getAppRoot } from "../shared/get-app-root.js"
import { getErrorMessage } from "../shared/get-error-message.js"
import { logger } from "../shared/logger.js"
import { getComponentsImport } from "./generate/get-components-import.js"
import { getConfigImport } from "./generate/get-config-import.js"
import { getStoryImports } from "./generate/get-story-imports.js"
import { getStoryList } from "./generate/get-story-list.js"
import { getStorySource } from "./generate/get-story-source.js"
import { getEntryData } from "./parse/get-entry-data.js"

export function mothmanPlugin(config: Config, configFolder: string, mode: string): PluginOption {
  const headHtmlPath = join(configFolder, "head.html")
  const resolvedVirtualModuleId = `\0${VIRTUAL_MODULE_ID}`

  return {
    name: "moth",

    resolveId(id: string) {
      if (id === VIRTUAL_MODULE_ID) {
        return resolvedVirtualModuleId
      }
      return null
    },

    transformIndexHtml(html: string, ctx: any) {
      if (ctx.path === "/index.html") {
        if (existsSync(headHtmlPath)) {
          const headHtml = readFileSync(headHtmlPath, "utf8")
          html = html.replace("</head>", `${headHtml}</head>`)
        }
        if (config.appendToHead !== "") {
          html = html.replace("</head>", `${config.appendToHead}</head>`)
        }
      }
      return html
    },

    async transform(code: string, id: string) {
      // We instrument stories with a simple eventemitter like code so
      // some addons (like a11y) can subscribe to changes and re-run
      // on HMR updates

      if (id.includes(".stories.")) {
        const from = join(getAppRoot(), "utils/story-hmr")
        const watcherImport = `import { storyUpdated } from "${from}";`
        // if stories are defined through .bind({}) we need to force full reloads since
        // react-refresh can't pick it up
        const invalidateHmr = code.includes(".bind({})")
          ? `if (import.meta.hot) {
          import.meta.hot.on("vite:beforeUpdate", () => {
            import.meta.hot.invalidate();
          });
        }`
          : ""

        // make sure the `loaded` attr is set even if the story is loaded through iframe
        const setLoadedAttr = `typeof window !== 'undefined' &&
          window.document &&
          window.document.createElement && document.documentElement.setAttribute("data-storyloaded", "");`

        return {
          code: `${code}\n${setLoadedAttr}\n${invalidateHmr}\n${watcherImport}\nif (import.meta.hot) {
          import.meta.hot.accept(() => {
            storyUpdated();
          });
        }`,
          map: null,
        }
      }
      return { code, map: null }
    },

    async load(id: string) {
      if (id === resolvedVirtualModuleId) {
        logger.debug(`transforming: ${id}`)

        try {
          logger.debug("Initial generation of the list")
          const stories = Array.isArray(config.stories) ? config.stories : [config.stories]
          const entryData = await getEntryData(await globby(stories))

          detectDuplicateStoryNames(entryData)

          const pluginData: string[] = [
            getStoryImports(entryData),
            getStoryList(entryData),
            getComponentsImport(configFolder),
            getStorySource(entryData, config.addons.source.enabled),
            await getConfigImport(configFolder, config),
            " export const errorMessage = '';",
          ]

          return pluginData.join(";\n")
        } catch (error) {
          logger.error("\x1b[31m%s", "\nStory discovering failed:\n")
          logger.error("\x1b[31m%s", getErrorMessage(error))
          logger.error("\x1b[31m%s", "\nMore info: https://moth.dev/docs/stories#limitations")

          if (mode === "production") {
            process.exit(1)
          }

          return defaultListModule(getErrorMessage(error))
        }
      }

      return
    },
  }
}

function detectDuplicateStoryNames(entryData: EntryData): void {
  const stories = new Map<string, [string, string]>()

  for (const [entryKey, entry] of Object.entries(entryData)) {
    for (const story of entry.stories) {
      if (!stories.has(story.storyId)) {
        stories.set(story.storyId, [entryKey, story.namedExport])
        continue
      }

      const existingEntry = stories.get(story.storyId)

      throw new Error(getDuplicateError(entryKey, story, existingEntry))
    }
  }
}

function getDuplicateError(entry: string, story: StoryEntry, existingEntry?: [string, string]): string {
  return `
  There are two stories with the same ID ${story.storyId} as a result
  of normalized file name and story name combination.
  
    - ${entry}: ${story.namedExport}
    - ${existingEntry?.[0]}: ${existingEntry?.[1]}
  
  Story IDs need to be unique.
  `
}

function defaultListModule(errorMessage: string) {
  return `
import { lazy } from "react";
import React from "react";
export const list = [];
export const config = {};
export const stories = {};
export const storySource = {};
export const errorMessage = \`${errorMessage}\`;
export const Provider = ({ children }) => /*#__PURE__*/ React.createElement(React.Fragment, null, children);`
}

import chokidar from "chokidar"
import { globby } from "globby"
import { ViteDevServer } from "vite"

import { Config } from "../app/src/types"
import { VIRTUAL_MODULE_ID } from "../const"
import { getErrorMessage } from "../shared/get-error-message"
import { logger } from "../shared/logger"
import { getMetaJson } from "../vite-plugin/generate/get-meta-json"
import { getEntryData } from "../vite-plugin/parse/get-entry-data"

export async function watcher(viteDevServer: ViteDevServer, config: Config) {
  if (config.noWatch === false) {
    // trigger full reload when new stories are added or removed
    const watcher = chokidar.watch(config.stories, { persistent: true, ignoreInitial: true })

    let checkSum = ""

    const getChecksum = async (): Promise<string> => {
      try {
        const stories = Array.isArray(config.stories) ? config.stories : [config.stories]
        const entryData = await getEntryData(await globby(stories))
        const jsonContent = getMetaJson(entryData)

        // loc changes should not grant a full reload
        for (const story of Object.values(jsonContent.stories)) {
          story.locStart = 0
          story.locEnd = 0
        }

        return JSON.stringify(jsonContent)
      } catch (error) {
        logger.error(getErrorMessage(error))
        return checkSum
      }
    }

    checkSum = await getChecksum()

    const invalidate = async () => {
      const newChecksum = await getChecksum()
      const shouldInvalidate = checkSum === newChecksum

      if (!shouldInvalidate) return

      checkSum = newChecksum
      const module = viteDevServer.moduleGraph.getModuleById(`\0${VIRTUAL_MODULE_ID}`)

      if (module) {
        viteDevServer.moduleGraph.invalidateModule(module)

        if (viteDevServer.ws) {
          viteDevServer.ws.send({ type: "full-reload", path: "*" })
        }
      }
    }

    watcher.on("add", invalidate).on("change", invalidate).on("unlink", invalidate)
  }
}

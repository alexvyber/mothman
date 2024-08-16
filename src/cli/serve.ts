import chokidar from "chokidar"
import getPort, { portNumbers } from "get-port"
import { globby } from "globby"
import { createServer as createViteServer, InlineConfig, searchForWorkspaceRoot } from "vite"

import { CLIParams } from "../app/src/types"
import { VIRTUAL_MODULE_ID } from "../const"
import { getAppId } from "../shared/get-app-id"
import { getErrorMessage } from "../shared/get-error-message"
import { logger } from "../shared/logger"
import { getMetaJson } from "../vite-plugin/generate/get-meta-json"
import { getEntryData } from "../vite-plugin/parse/get-entry-data"
import { applyCLIConfig } from "./apply-cli-config"
import { getViteBaseConfig } from "./get-vite-base-config"
import { app } from "./app"

export async function serve(cliParams: CLIParams) {
  process.env.VITE_MTH_APP_ID = await getAppId()

  const { configFolder, config } = await applyCLIConfig(cliParams)

  const hmrPort = await getPort({ port: [...portNumbers(33333, 33343)] })

  const viteConfig: InlineConfig = await getViteBaseConfig(
    config,
    {
      mode: config.mode || "development",
      server: {
        open: false,
        host: config.host,
        port: config.port,
        // needed for hmr to work over network aka WSL2
        hmr: config.noWatch ? false : { host: config.hmrHost ?? "localhost", port: config.hmrPort ?? hmrPort },
        middlewareMode: true,
        fs: { allow: [searchForWorkspaceRoot(process.cwd())] },
        watch: config.noWatch ? null : undefined,
      },
    },
    configFolder
  )

  const viteDevServer = await createViteServer(viteConfig)

  await app(viteDevServer, config, viteConfig)

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

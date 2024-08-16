import { createServer as createHTTPServer } from "node:http"
import { join } from "node:path"
import chokidar from "chokidar"
import getPort, { portNumbers } from "get-port"
import { globby } from "globby"
import koa from "koa"
import c2k from "koa-connect"
import { createServer as createViteServer, InlineConfig, searchForWorkspaceRoot } from "vite"

import { CLIParams } from "../app/src/types"
import { VIRTUAL_MODULE_ID } from "../const"
import { getAppId } from "../shared/get-app-id"
import { getErrorMessage } from "../shared/get-error-message"
import { logger } from "../shared/logger"
import { getMetaJson } from "../vite-plugin/generate/get-meta-json"
import { getEntryData } from "../vite-plugin/parse/get-entry-data"
import { applyCLIConfig } from "./apply-cli-config"
import { getListenCallback } from "./get-listen-callback"
import { getViteBaseConfig } from "./get-vite-base-config"

// function app(){
//   const app = new koa()
// }

export async function serve(cliParams: CLIParams) {
  const app = new koa()

  process.env.VITE_MTH_APP_ID = await getAppId()

  const { configFolder, config } = await applyCLIConfig(cliParams)

  const port = await getPort({ port: [config?.port, ...portNumbers(42069, 42079)].filter(Boolean) })
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

  const redirectBase =
    viteConfig.base && viteConfig.base !== "/" && viteConfig.base !== "./" ? viteConfig.base : undefined
  const metaUrl = redirectBase ? join(redirectBase, "meta.json") : "/meta.json"

  app.use(async (ctx, next) => {
    if (ctx.request.method === "GET" && ctx.request.url === metaUrl) {
      const stories = Array.isArray(config.stories) ? config.stories : [config.stories]
      const entryData = await getEntryData(await globby(stories))
      const jsonContent = getMetaJson(entryData)

      ctx.body = jsonContent

      return
    }

    if (ctx.request.method === "GET" && redirectBase) {
      if (ctx.request.url === "/" || ctx.request.url === "/index.html") {
        ctx.redirect(redirectBase)
        return
      }

      if (ctx.request.url === "/meta.json") {
        ctx.redirect(join(redirectBase, "meta.json"))
        return
      }
    }

    if (ctx.request.method === "HEAD") {
      ctx.status = 200
      return
    }

    await next()
  })
  app.use(c2k(viteDevServer.middlewares))

  const useHttps =
    typeof viteDevServer.config.server?.https === "object" &&
    viteDevServer.config.server.https.key &&
    viteDevServer.config.server.https.cert

  const hostname =
    config.host ??
    (viteDevServer.config.server.host === true
      ? "0.0.0.0"
      : typeof viteDevServer.config.server.host === "string"
        ? viteDevServer.config.server.host
        : "localhost")

  const serverUrl = `${useHttps ? "https" : "http"}://${hostname}:${port}${viteDevServer.config.base || ""}`

  const listenCallback = getListenCallback(viteDevServer, serverUrl)

  createHTTPServer(app.callback()).listen(port, hostname, listenCallback)

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

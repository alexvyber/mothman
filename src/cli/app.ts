import { createServer as createHTTPServer } from "node:http"
import { join } from "node:path"
import getPort, { portNumbers } from "get-port"
import { globby } from "globby"
import koa from "koa"
import c2k from "koa-connect"
import { InlineConfig, ViteDevServer } from "vite"

import { Config } from "../app/src/types"
import { getMetaJson } from "../vite-plugin/generate/get-meta-json"
import { getEntryData } from "../vite-plugin/parse/get-entry-data"
import { getListenCallback } from "./get-listen-callback"

export async function app(viteDevServer: ViteDevServer, config: Config, viteConfig: InlineConfig) {
  const app = new koa()
  const port = await getPort({ port: [config?.port, ...portNumbers(42069, 42079)].filter(Boolean) })

  const redirectBase =
    viteConfig.base && viteConfig.base !== "/" && viteConfig.base !== "./" ? viteConfig.base : undefined
  const metaUrl = redirectBase ? join(redirectBase, "meta.json") : "/meta.json"

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
}

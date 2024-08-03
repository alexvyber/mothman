import Fastify from "fastify"
import FastifyVite from "@fastify/vite"
import getPort, { portNumbers } from "get-port"
import { openBrowser } from "./open-browser/open-browser"

export async function main() {
  const server = Fastify()

  await server.register(FastifyVite, {
    root: import.meta.url,
    dev: true,
    spa: true,
  })

  server.get("/", (req, reply) => {
    return reply.html()
  })

  await server.vite.ready()

  return server
}

export async function serve(config?: any) {
  // TODO:
  // create and configure fastify server
  // create and configure vite server
  // configure hmr
  // configure and init watcher
  // manage requests

  const port = await getPort({ port: portNumbers(config?.port ?? 42069, 42079) })
  const hmrPort = await getPort({ port: portNumbers(config?.port ?? 33333, 33343) })

  const server = await main()

  server.listen({ port }, () => {
    const url = `http://localhost:${port}`
    openBrowser(url)
    console.log(`server started on ${url}`)
  })
}

import Fastify from "fastify"
import getPort, { portNumbers } from "get-port"
import { createServer as createViteServer } from "vite"
import FastifyVite from "@fastify/vite"
import { resolve } from "path"
import { fileURLToPath } from "node:url"

export async function createServer(dev?: boolean) {
  const server = Fastify()

  await server.register(FastifyVite, {
    root: resolve(import.meta.dirname),
    dev: dev ?? process.argv.includes("--dev"),
    spa: true,
  })

  server.get("/", (req, reply) => {
    return reply.html()
  })

  await server.vite.ready()
  return server
}

viteServe()

export async function viteServe(config?: any) {
  // if (process.argv[1] === fileURLToPath(import.meta.url)) {
  const server = await createServer()
  console.log("🚀 ~ viteServe ~ server:", server)
  await server.listen({ port: 3000 })
  // }

  // TODO:
  // const fastify = Fastify({
  //   logger: true,
  // })

  // const port = await getPort({ port: portNumbers(config?.port ?? 42069, 42079) })

  // const hmrPort = await getPort({ port: portNumbers(config?.port ?? 33333, 33343) })

  // const server = Fastify()

  // const root = resolve(import.meta.dirname, "../app")
  // console.log("🚀 ~ viteServe ~ root:", root)

  // await server.register(FastifyVite, {
  //   root,
  //   bundle: {},
  //   vite: {
  //     root,
  //   },
  //   // dev: process.argv.includes("--dev"),
  //   // spa: true,
  // })

  // server.get("/", (req, reply) => {
  //   return reply.html()
  // })

  // await server.vite.ready()

  // server.listen({ port: 3000 }, (error, address) => console.log("🚀 ~ viteServe ~ error,address:", error, address))

  // create and configure base server
  // create and configure vite server
  // configure hmr
  // configure and init watcher
  // manage requests
  // open browser with app running
}

// if (process.argv[1] === fileURLToPath(import.meta.url)) {
//   const server = await main()
//   await server.listen({ port: 3000 })
// }

import { fileURLToPath } from "node:url"
import Fastify from "fastify"
import FastifyVite from "@fastify/vite"

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

export async function devRun(params?: any) {
  const server = await main()
  await server.listen({ port: 3000 })
}

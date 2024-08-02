import { viteServe } from "./vite-serve.js"

type Options = {
  port: number
  host: string
}

export async function serve(config?: Partial<Options>) {
  viteServe(config)
}

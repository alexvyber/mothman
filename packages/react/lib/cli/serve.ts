import { Options } from "./options.js"
import { viteServe } from "./vite-serve.js"

export async function serve(config?: Partial<Options>) {
  // do some config stuff...

  viteServe()
}

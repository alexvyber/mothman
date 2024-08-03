import { resolve } from "node:path"
import viteReact from "@vitejs/plugin-react"

const root = resolve(import.meta.dirname, "app")
const plugins = [viteReact({ jsxRuntime: "classic" })]

export default {
  root,
  plugins,
}

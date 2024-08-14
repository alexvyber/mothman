import { resolve } from "node:path"
// import viteReact from "@vitejs/plugin-react"
import viteReactSws from "@vitejs/plugin-react-swc"
import Inspect from "vite-plugin-inspect"
// import { PluginOption } from "vite"
import { dumbVitePlugin } from "./lib/vite-plugin/dumb"

const root = resolve(import.meta.dirname, "lib/app")

const plugins = [
  // viteReact({ jsxRuntime: "classic" }),
  viteReactSws(),
  Inspect(),
  dumbVitePlugin(false),
]

export default { root, plugins }

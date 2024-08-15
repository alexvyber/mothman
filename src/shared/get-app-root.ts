import { join } from "node:path"

export function getAppRoot() {
  return join(import.meta.dirname, "../app")
}

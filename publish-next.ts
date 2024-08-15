import { execSync } from "node:child_process"
import { writeFile } from "node:fs/promises"

import pkg from "./package.json"
import { execAsync } from "./src/shared/exec-async"
import { getErrorMessage } from "./src/shared/get-error-message"
import { logger } from "./src/shared/logger"

const tmpVersion = `0.0.0-next-${execSync("git rev-parse --short HEAD").toString().trim()}`
const currentVersion = pkg.version
pkg.version = tmpVersion

await writeFile("./package.json", JSON.stringify(pkg, null, 2))

try {
  logger.info(await execAsync("npm publish --tag next"))
} catch (error) {
  logger.error(getErrorMessage(error))
  logger.error("Publish failed, reverting package.json")
}

pkg.version = currentVersion
await writeFile("./package.json", JSON.stringify(pkg, null, 2))

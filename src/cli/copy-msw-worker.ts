import { access, copyFile, mkdir } from "node:fs/promises"
import { createRequire } from "node:module"
import { join } from "node:path"

import { getErrorMessage } from "../shared/get-error-message"
import { logger } from "../shared/logger"

export async function copyMswWorker(publicDir: string): Promise<void> {
  try {
    await access(publicDir)
  } catch {
    try {
      await mkdir(publicDir)
    } catch (error) {
      logger.error(`Error copying msw worker: ${getErrorMessage(error)}`)
    }
  }

  const mswWorkerPath = join(publicDir, "mockServiceWorker.js")
  const mswPath = createRequire(import.meta.url).resolve("msw")

  await copyFile(join(mswPath, "../../mockServiceWorker.js"), mswWorkerPath)
}

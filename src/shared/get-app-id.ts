import { createHash } from "node:crypto"
import { readFile } from "node:fs/promises"
import { join } from "node:path"

import { logger } from "./logger"

export async function getAppId(): Promise<string> {
  let pkgName = "unknown"

  try {
    const pkgPath = join(process.cwd(), "package.json")
    const pkgJson = JSON.parse(await readFile(pkgPath, "utf-8"))
    pkgName = pkgJson.name
  } catch (error) {
    logger.error(error)
  }

  return createHash("sha256").update(`${process.cwd()}#${pkgName}`).digest("hex").slice(0, 6)
}

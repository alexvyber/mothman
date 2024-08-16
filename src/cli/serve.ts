import { createServer as createViteServer } from "vite"

import { CLIParams } from "../app/src/types"
import { getAppId } from "../shared/get-app-id"
import { app } from "./app"
import { applyCLIConfig } from "./apply-cli-config"
import { getViteConfig } from "./get-vite-config"
import { watcher } from "./watcher"

export async function serve(cliParams: CLIParams) {
  process.env.VITE_MTH_APP_ID = await getAppId()

  const { configFolder, config } = await applyCLIConfig(cliParams)

  const viteConfig = await getViteConfig(config, configFolder)

  const viteDevServer = await createViteServer(viteConfig)

  await watcher(viteDevServer, config)

  await app(viteDevServer, config, viteConfig)
}

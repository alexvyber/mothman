// import { openBrowser } from "../shared/open-browser"
import { styleText } from "node:util"
import { ViteDevServer } from "vite"

import { logger } from "../shared/logger"

export const getListenCallback = (viteDevServer: ViteDevServer, serverUrl: string) => () => {
  logger.info(`${styleText(["bold", "blue"], `▌ 🦋 moth-man.dev served at ${serverUrl} ▌`)}`)

  if (viteDevServer.config.server.open !== "none" && viteDevServer.config.server.open !== false) {
    // openBrowser(serverUrl)
  }
}

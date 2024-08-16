import { styleText } from "node:util"
import { ViteDevServer } from "vite"

import { logger } from "../shared/logger"
import { openBrowser } from "../shared/open-browser"

export function getListenCallback(viteDevServer: ViteDevServer, serverUrl: string) {
  return () => {
    logger.info(`${styleText(["bold", "blue"], `▌ 🦋 moth-man.dev served at ${serverUrl} ▌`)}`)

    const isOpenBrowser = viteDevServer.config.server.open !== "none" && viteDevServer.config.server.open !== false

    if (isOpenBrowser) {
      openBrowser(serverUrl)
    }
  }
}

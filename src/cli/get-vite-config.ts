import getPort, { portNumbers } from "get-port"
import { InlineConfig, searchForWorkspaceRoot } from "vite"

import { Config } from "../app/src/types"
import { getViteBaseConfig } from "./get-vite-base-config"

export async function getViteConfig(config: Config, configFolder: string): Promise<InlineConfig> {
  return getViteBaseConfig(
    config,
    {
      mode: config.mode || "development",
      server: {
        open: false,
        host: config.host,
        port: config.port,
        // needed for hmr to work over network aka WSL2
        hmr: config.noWatch
          ? false
          : {
              host: config.hmrHost ?? "localhost",
              port: config.hmrPort ?? (await getPort({ port: [...portNumbers(33333, 33343)] })),
            },
        middlewareMode: true,
        fs: { allow: [searchForWorkspaceRoot(process.cwd())] },
        watch: config.noWatch ? null : undefined,
      },
    },
    configFolder
  )
}

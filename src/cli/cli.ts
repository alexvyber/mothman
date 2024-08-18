import { Command } from "commander"

import { serve } from "./serve.js"

const program = new Command("moth")

program.showHelpAfterError().showSuggestionAfterError()

program
  .command("serve")
  .description("serve stories in dev mode")
  .option("-h, --host [string]", "host to serve the application")
  .option("-p, --port [number]", "port to serve the application", strToInt)
  .option("-n, --no-watch", "Disable file system watching")
  .option("-c, --config [string]", "folder where config is located, default .ladle")
  .option("-s, --stories [string]", "glob to find stories")
  .option("-t, --theme [string]", "theme light, dark or auto")
  .option("-v, --vite-config [string]", "file with Vite configuration")
  .option("-b, --base [string]", "base URL path for build output")
  .option("-m, --mode [string]", "Vite mode")
  .action(serve)

program.parse(process.argv)

function strToInt(n: string) {
  return Number.parseInt(n, 10)
}

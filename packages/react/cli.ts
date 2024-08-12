import { Command } from "commander"
import { serve } from "./serve.js"

const program = new Command("mothman")

program.showHelpAfterError().showSuggestionAfterError()

program
  .command("serve")
  .description("start developing")
  .option("-h, --host [string]", "host to serve the application")
  .option("-p, --port [number]", "port to serve the application", strToInt)
  .action(serve)

program.parse(process.argv)

function strToInt(n: string) {
  return Number.parseInt(n, 10)
}

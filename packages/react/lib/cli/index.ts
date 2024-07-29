import { parseArgs } from "node:util"
import { serve } from "./serve.js"
import { options } from "./options.js"
import { build } from "./build.js"
import { preview } from "./preview.js"

// TODO: find out the best way to parse args for each command separatly
// ???: do I realy need to parse theme separately?
const args = parseArgs({
  args: process.args,
  options,
  allowPositionals: true,
})

// exactly one positional expected
if (args.positionals.length !== 1) {
  throw new Error("TOOD: ERR_TODO")
}

switch (args.positionals[0]) {
  case "serve":
    serve(args.values)
    break

  case "build":
    build(args.values)
    break

  case "preview":
    preview(args.values)
    break

  default:
    throw new Error("TOOD: ERR_NEVER_TO_DO_HELP")
}

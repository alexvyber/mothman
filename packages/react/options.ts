import { ParseArgsConfig } from "node:util"
import { ProduceOptions } from "./types.js"

// TODO: add all other args
export const options = {
  host: {
    type: "string",
    short: "h",
  },
  port: {
    type: "string",
    short: "p",
  },
} satisfies ParseArgsConfig["options"]
export type Options = ProduceOptions<typeof options>

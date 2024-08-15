import queryString from "query-string"

import { defaultConfig } from "../../../../../shared/default-config"

const options = defaultConfig.addons.width.options

export function getQuery(locationSearch: string) {
  const width = queryString.parse(locationSearch).width

  let res = 0

  for (const key of Object.keys(options) as Array<keyof typeof options>) {
    if (key === width || (typeof width === "string" && Number.parseInt(width, 10) === options?.[key])) {
      res = options[key] ?? res
    }
  }

  return res !== 0 ? res : defaultConfig.addons.width.defaultState
}

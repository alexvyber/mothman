import queryString from "query-string"

import { defaultConfig } from "../../../../../shared/default-config"

export function getQuery(locationSearch: string) {
  const source = queryString.parse(locationSearch).source

  if (source === "true") {
    return true
  }
  if (source === "false") {
    return false
  }

  return defaultConfig.addons.source.defaultState
}

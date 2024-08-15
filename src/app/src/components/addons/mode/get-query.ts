import queryString from "query-string"

import { defaultConfig } from "../../../../../shared/default-config"
import { Mode } from "../../../types"

export function getQuery(locationSearch: string) {
  const mode = queryString.parse(locationSearch).mode

  switch (mode) {
    case Mode.Full:
      return Mode.Full

    case Mode.Preview:
      return Mode.Preview

    default:
      return defaultConfig.addons.mode.defaultState
  }
}

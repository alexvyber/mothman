import queryString from "query-string"

import { Theme } from "../../../types"

export function getQuery(locationSearch: string) {
  const theme = queryString.parse(locationSearch).theme

  switch (theme) {
    case Theme.Light:
      return Theme.Light

    case Theme.Dark:
      return Theme.Dark

    case Theme.Auto:
      return Theme.Auto

    default:
      return (import.meta as any).env.VITE_PUBLIC_MTH_THEME || Theme.Light
  }
}

import { createBrowserHistory } from "history"
import queryString, { ParsedQuery } from "query-string"

import { getErrorMessage } from "../../shared/get-error-message"
import { logger } from "../../shared/logger"
import { Control, GlobalState } from "../src/types"
import config from "./load-config"

export { Action } from "history"

export const history = createBrowserHistory()

export function resetParams() {
  history.push(getHref())
}

export function modifyParams(globalState: GlobalState) {
  if (!globalState.controlInitialized) {
    return
  }

  const queryParams = queryString.parse(location.search)

  const userQueryParams = {} as Record<string, ParsedQuery<string>[string]>

  for (const [key, value] of Object.entries(queryParams)) {
    if (!key.startsWith("arg-")) {
      userQueryParams[key] = value
    }
  }

  const params = {
    ...userQueryParams,
    mode: globalState.mode,
    source: globalState.source,
    story: globalState.story,
    theme: globalState.theme,
    width: globalState.width,
    control: globalState.control,
  }

  removeDefaultValues(params)

  const href = getHref(params)

  if (href && location.search !== getHref(params)) {
    history.push(href)
  }
}

export function getHref(params: Partial<GlobalState> = {}): string {
  removeDefaultValues(params)

  const encodedParams = {} as Record<string, string>

  for (const [key, value] of Object.entries(params)) {
    if (!(key === "control")) {
      Object.assign(encodedParams, { [key]: value })
    }

    if (key === "control") {
      // for controls we are spreading individual args into URL
      for (const [param, entry] of Object.entries(value)) {
        const arg = entry

        // a special case, actions are handled by the addon-action
        if (arg.type === Control.Action) continue

        try {
          const isValueDefault = JSON.stringify(arg.value) === JSON.stringify(arg.defaultValue)

          const valueToEncode = typeof arg.value === "string" ? arg.value : JSON.stringify(arg.value)
          const encoded = encodeURI(valueToEncode)

          if (!isValueDefault && JSON.stringify(encoded) !== JSON.stringify(arg.defaultValue)) {
            encodedParams[`arg-${param}`] = encoded
          }
        } catch (error) {
          logger.warn(`Error get control params ${getErrorMessage(error)}`)
        }
      }
    }
  }

  return `?${queryString.stringify(encodedParams)}`
}

function removeDefaultValues(params: Partial<GlobalState>): void {
  for (const [key, value] of Object.entries(params)) {
    if (key in config.addons) {
      const val = config.addons[key as keyof typeof config.addons]
      const defaultVal = val && "defaultState" in val ? val.defaultState : "$$MONTHMAN_UNKNOWN"

      if (value === defaultVal) {
        delete params[key as keyof typeof params]
      }
    }
  }
}

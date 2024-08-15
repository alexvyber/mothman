import queryString from "query-string"

import { coerceString } from "../../../../utils/coerce-string"
import { Control, ControlState } from "../../../types"

export function getQuery(locationSearch: string, controlState: ControlState) {
  const params = queryString.parse(locationSearch)
  const controls = {} as Record<string, any>

  // we first need controls being initialized from stories so we know types
  // before taking over from url
  if (Object.keys(controlState).length === 0) {
    return controlState
  }

  for (const paramKey of Object.keys(params)) {
    if (paramKey.startsWith("arg-") && controlState[paramKey.split("-")[1]]) {
      const keyParts = paramKey.split("-")

      const argKey = keyParts[1]
      if (!argKey) {
        continue
      }

      const argValue = params[paramKey] as string
      const argType = controlState[argKey]?.type
      if (argType === Control.Action) {
        continue
      }

      let realValue: unknown = argValue

      switch (argType) {
        case Control.String:
          realValue = decodeURI(argValue)
          break

        case Control.Boolean:
          realValue = argValue === "true"
          break

        case Control.Range:
          realValue = Number.parseFloat(argValue)
          break

        case Control.Number:
          realValue = Number.parseInt(argValue, 10)
          break

        case Control.Complex:
          realValue = JSON.parse(decodeURI(argValue))
          break

        case Control.Radio:
        case Control.InlineRadio:
        case Control.Select:
        case Control.Background:
          realValue = coerceString(decodeURI(argValue), controlState[argKey]?.options)
          break

        case Control.InlineCheck:
        case Control.MultiSelect:
        case Control.Check:
          realValue = coerceString(JSON.parse(decodeURI(argValue)), controlState[argKey]?.options)
          break
      }

      controls[argKey] = {
        value: realValue,
        defaultValue: controlState[argKey]?.defaultValue,
        description: controlState[argKey]?.description,
        type: controlState[argKey]?.type,
      }
    }
  }

  return controls
}

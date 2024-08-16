import React, { createElement, useEffect } from "react"

import { getQuery } from "../src/components/addons/control/get-query"
import { Action, Control, ControlEnum, ControlState } from "../src/types"
import { useMothmanContext } from "../utils/global-context"

const ALLOWED_ARGTYPES = [
  "select",
  "multi-select",
  "radio",
  "inline-radio",
  "background",
  "check",
  "inline-check",
  "range",
  "color",
  "date",
  "number",
  "text",
  "boolean",
]

function ArgsProvider({ component, args, argTypes }: { component: any; args: any; argTypes: any }) {
  const { globalState, dispatch } = useMothmanContext()

  const actionLogger = (name: string) => (event: Event) => {
    dispatch({ type: Action.UpdateAction, payload: { value: { name, event }, clear: false } })
  }

  useEffect(() => {
    const controls = {} as ControlState

    if (args) {
      for (const argKey of Object.keys(args)) {
        const argValue = args[argKey]

        if (globalState.control[argKey]) {
          Object.assign(controls, {
            [argKey]: {
              type: globalState.control[argKey].type,
              defaultValue: argValue,
              value: globalState.control[argKey].value,
              description: "",
            },
          })
        }

        if (!globalState.control[argKey]) {
          let type: ControlEnum = Control.Complex

          switch (typeof argValue) {
            case "function":
              type = Control.Function
              break

            case "boolean":
              type = Control.Boolean
              break

            case "number":
              type = Control.Number
              break

            case "string":
              type = Control.String
              break
          }

          Object.assign(controls, { [argKey]: { type, defaultValue: argValue, value: argValue, description: "" } })
        }
      }
    }

    let bgControls = 0

    if (argTypes) {
      for (const argKey of Object.keys(argTypes)) {
        const argValue = argTypes[argKey]

        if (argValue?.action) {
          Object.assign(controls, {
            [argKey]: {
              type: Control.Action,
              defaultValue: actionLogger(argKey),
              value: actionLogger(argKey),
              description: "",
            },
          })

          continue
        }

        if (!argValue.control?.type) {
          throw new Error("argTypes should have control type specified")
        }

        if (ALLOWED_ARGTYPES.indexOf(argValue.control.type) === -1) {
          throw new Error(
            `only ${ALLOWED_ARGTYPES.join(
              ", "
            )} argTypes are supported now. For strings, booleans and numbers use just args.`
          )
        }

        if (argValue.control.type === "background") {
          bgControls++

          if (bgControls > 1) {
            throw new Error(
              "There can be only single argType with the type background since it's used to change Mothman's background color."
            )
          }
        }

        Object.assign(controls, {
          [argKey]: {
            name: argValue.name,
            type: argValue.control.type,
            labels: argValue.control.labels,
            defaultValue: args[argKey] ? args[argKey] : argValue.defaultValue,
            options: argValue.options,
            value: args[argKey] ? args[argKey] : argValue.defaultValue,
            description: argValue.description || argKey,
            min: argValue.control.min,
            max: argValue.control.max,
            step: argValue.control.step,
          },
        })

        if (globalState.control[argKey]) {
          controls[argKey].value = globalState.control[argKey].value
        }
      }
    }

    if (Object.keys(controls).length) {
      const urlValues = getQuery(location.search, controls)

      for (const key of Object.keys(urlValues)) {
        controls[key].value = urlValues[key].value
      }

      const shouldUpdate = Object.entries(controls).some(
        ([key, entry]) => !globalState.control[key] || entry.value !== globalState.control[key].value
      )

      if (shouldUpdate) {
        dispatch({ type: Action.UpdateControl, payload: controls })
      }
    } else if (!globalState.controlInitialized) {
      dispatch({ type: Action.UpdateControlIntialized, payload: true })
    }
  }, [])

  const mappingValue = (key: string, value: any) => {
    if (argTypes?.[key]?.mapping && Object.prototype.hasOwnProperty.call(argTypes[key].mapping, value)) {
      return argTypes[key].mapping[value]
    }
    return value
  }

  const props = {} as Record<string, any>

  for (const key of Object.keys(globalState.control)) {
    if (Array.isArray(globalState.control[key].value)) {
      props[key] = globalState.control[key].value.map((value) => mappingValue(key, value))
    } else {
      props[key] = mappingValue(key, globalState.control[key].value)
    }
  }

  if (!globalState.controlInitialized) {
    return null
  }

  return createElement(component, props)
}

export default ArgsProvider

import { useHotkeys } from "react-hotkeys-hook"

import { useState } from "react"

import { useMothmanContext } from "../../../../utils/global-context"
import config from "../../../../utils/load-config"
import { Action, Control, ControlEnum, ControlState } from "../../../types"
import { Controls } from "../../icons"
import { Modal } from "../../ui/modal"

const getInputType = (type?: ControlEnum) => {
  switch (type) {
    case Control.Boolean:
      return "checkbox"

    case Control.Number:
      return "number"

    case Control.Range:
      return "range"

    default:
      return "text"
  }
}

const getInputValue = (target: HTMLInputElement, type?: ControlEnum) => {
  switch (type) {
    case Control.Boolean:
      return target.checked

    case Control.Number:
    case Control.Range:
      return Number.parseFloat(target.value)

    default:
      return target.value
  }
}

const coerceString = (value: string, options?: any[]) => {
  if (options?.some((option) => option === Number(value))) {
    return Number(value)
  }

  const isBoolean = value === "true" || value === "false"

  return isBoolean ? value !== "false" : value
}

const ControlAddon = ({ controlKey }: { controlKey: string }) => {
  const { globalState, dispatch } = useMothmanContext()
  const controlState = globalState.control[controlKey]
  const controlName = globalState.control[controlKey].name || controlKey

  if (globalState.control[controlKey].type === Control.Action) {
    return (
      <tr>
        <td>{controlName}</td>
        <td>action</td>
      </tr>
    )
  }

  if (globalState.control[controlKey].type === Control.Function) {
    return (
      <tr>
        <td>{controlName}</td>
        <td>function</td>
      </tr>
    )
  }

  if (
    globalState.control[controlKey].type === Control.Radio ||
    globalState.control[controlKey].type === Control.InlineRadio ||
    (globalState.control[controlKey].type === Control.Background &&
      (globalState.control[controlKey].options as string[]).length < 5)
  ) {
    return (
      <tr>
        <td>{controlName}</td>
        <td style={globalState.control[controlKey].type === Control.InlineRadio ? { display: "flex" } : {}}>
          {(globalState.control[controlKey].options || []).map((option) => {
            const value = globalState.control[controlKey].value
            const labels = globalState.control[controlKey].labels || {}
            const label = labels[option] || option
            const isChecked = value === option || value === String(option)
            return (
              <div
                key={`${String(option)}-${controlKey}`}
                style={{
                  display: "flex",
                  alignItems: "center",
                  ...(globalState.control[controlKey].type === Control.InlineRadio ? { paddingRight: "0.5em" } : {}),
                }}
              >
                <input
                  id={`${controlKey}-${String(option)}`}
                  type="radio"
                  name={controlKey}
                  value={String(option)}
                  onChange={() => {
                    dispatch({
                      type: Action.UpdateControl,
                      payload: {
                        ...globalState.control,
                        [controlKey]: {
                          ...globalState.control[controlKey],
                          value: coerceString(String(option), globalState.control[controlKey].options),
                        },
                      },
                    })
                  }}
                  checked={isChecked}
                />
                <label htmlFor={`${controlKey}-${String(option)}`}>{String(label)}</label>
              </div>
            )
          })}
        </td>
      </tr>
    )
  }

  if (
    globalState.control[controlKey].type === Control.Check ||
    globalState.control[controlKey].type === Control.InlineCheck ||
    globalState.control[controlKey].type === Control.MultiSelect
  ) {
    return (
      <tr>
        <td>{controlName}</td>
        <td style={globalState.control[controlKey].type === Control.InlineCheck ? { display: "flex" } : {}}>
          {(globalState.control[controlKey].options || []).map((option) => {
            const value = new Set(globalState.control[controlKey].value)
            const labels = globalState.control[controlKey].labels || {}
            const label = labels[option] || option
            return (
              <div
                key={`${String(option)}-${controlKey}`}
                style={{
                  display: "flex",
                  alignItems: "center",
                  ...(globalState.control[controlKey].type === Control.InlineCheck ? { paddingRight: "0.5em" } : {}),
                }}
              >
                <input
                  id={`${controlKey}-${String(option)}`}
                  type="checkbox"
                  name={`${controlKey}-${String(option)}`}
                  value={String(option)}
                  checked={value.has(String(option))}
                  onChange={() => {
                    const newValue = String(option)
                    if (value.has(newValue)) {
                      value.delete(newValue)
                    } else {
                      value.add(newValue)
                    }
                    dispatch({
                      type: Action.UpdateControl,
                      payload: {
                        ...globalState.control,
                        [controlKey]: {
                          ...globalState.control[controlKey],
                          value: value.size > 0 ? Array.from(value) : undefined,
                        },
                      },
                    })
                  }}
                />
                <label
                  htmlFor={`${controlKey}-${String(option)}`}
                  style={{ marginLeft: "0.3em" }}
                >
                  {String(label)}
                </label>
              </div>
            )
          })}
        </td>
      </tr>
    )
  }

  if (
    globalState.control[controlKey].type === Control.Select ||
    globalState.control[controlKey].type === Control.Background
  ) {
    return (
      <tr>
        <td>
          <label htmlFor={controlKey}>{controlName}</label>
        </td>
        <td>
          <select
            id={controlKey}
            value={String(globalState.control[controlKey].value)}
            onChange={(e) => {
              const labels = globalState.control[controlKey].labels || {}
              const newValue = Object.keys(labels).find((key) => labels[key] === e.target.value) || e.target.value
              dispatch({
                type: Action.UpdateControl,
                payload: {
                  ...globalState.control,
                  [controlKey]: {
                    ...globalState.control[controlKey],
                    value: coerceString(newValue, globalState.control[controlKey].options),
                  },
                },
              })
            }}
          >
            <option
              value="undefined"
              disabled={true}
            >
              Choose option...
            </option>

            {(globalState.control[controlKey].options || []).map((option) => {
              const labels = globalState.control[controlKey].labels || {}
              const label = labels[option] || option
              return <option key={`${option}-${controlKey}`}>{String(label)}</option>
            })}
          </select>
        </td>
      </tr>
    )
  }

  if (globalState.control[controlKey].type === Control.Complex) {
    let stringValue = ""
    try {
      stringValue = JSON.stringify(globalState.control[controlKey].value)
    } catch (e) {
      stringValue = "Object/Array argument must be serializable."
    }
    return (
      <tr>
        <td>
          <label htmlFor={controlKey}>{controlName}</label>
        </td>
        <td>
          <textarea
            id={controlKey}
            defaultValue={stringValue}
            onChange={(e) => {
              let value = globalState.control[controlKey].value
              try {
                value = JSON.parse(e.target.value)
              } catch (e) {}
              dispatch({
                type: Action.UpdateControl,
                payload: {
                  ...globalState.control,
                  [controlKey]: {
                    ...globalState.control[controlKey],
                    value,
                  },
                },
              })
            }}
          />
        </td>
      </tr>
    )
  }

  if (controlState.type === Control.Range) {
    // the fallback values are based on the standard range validation defaults,
    // see: https://developer.mozilla.org/en-US/docs/Web/HTML/Element/input/range#validation
    const displayMin = controlState.min ?? 0
    const displayMax = controlState.max ?? 100

    return (
      <tr>
        <td>
          <label htmlFor={controlKey}>{controlName}</label>
        </td>
        <td>
          {displayMin}
          <input
            id={controlKey}
            type={getInputType(controlState.type)}
            value={controlState.value}
            min={controlState.min}
            max={controlState.max}
            step={controlState.step}
            onChange={(e) =>
              dispatch({
                type: Action.UpdateControl,
                payload: {
                  ...globalState.control,
                  [controlKey]: {
                    ...controlState,
                    value: getInputValue(e.target, controlState.type),
                  },
                },
              })
            }
          />
          {controlState.value} / {displayMax}
        </td>
      </tr>
    )
  }

  return (
    <tr>
      <td>
        <label htmlFor={controlKey}>{controlName}</label>
      </td>
      <td>
        <input
          id={controlKey}
          type={getInputType(globalState.control[controlKey].type)}
          value={globalState.control[controlKey].value}
          checked={
            globalState.control[controlKey].type === Control.Boolean && globalState.control[controlKey].value === true
          }
          onChange={(e) =>
            dispatch({
              type: Action.UpdateControl,
              payload: {
                ...globalState.control,
                [controlKey]: {
                  ...globalState.control[controlKey],
                  value: getInputValue(e.target, globalState.control[controlKey].type),
                },
              },
            })
          }
        />
      </td>
    </tr>
  )
}

export const ControlButton = () => {
  const { globalState, dispatch } = useMothmanContext()

  const [open, setOpen] = useState(false)

  useHotkeys(config.hotkeys.control, () => setOpen((prev) => !prev), {
    enabled: globalState.hotkeys && config.addons.control.enabled,
  })

  const text = "Explore different versions of this story through controls."

  const activeControls = Object.keys(globalState.control).filter(
    (key) => JSON.stringify(globalState.control[key].value) !== JSON.stringify(globalState.control[key].defaultValue)
  )

  if (!(Object.keys(globalState.control).length > 0)) {
    return null
  }

  return (
    <li>
      <button
        aria-label={text}
        title={text}
        onClick={() => setOpen(true)}
        className={open ? "moth-active" : ""}
        data-testid="addon-control"
        type="button"
      >
        <Controls />

        <span className="moth-addon-tooltip">{text}</span>

        <label>Story Controls</label>

        {activeControls.length ? <div className="moth-badge">{activeControls.length}</div> : null}

        <Modal
          isOpen={open}
          close={() => setOpen(false)}
          label="Toggle different controls to update the story."
        >
          <table className="moth-controls-table">
            <tbody>
              {Object.keys(globalState.control)
                .sort()
                .map((controlKey) => {
                  return (
                    <ControlAddon
                      key={controlKey}
                      controlKey={controlKey}
                    />
                  )
                })}
            </tbody>
          </table>

          <button
            onClick={() => {
              const controls: ControlState = {}

              Object.keys(globalState.control).forEach((control) => {
                controls[control] = {
                  ...globalState.control[control],
                  value: globalState.control[control].defaultValue,
                }
              })

              dispatch({ type: Action.UpdateControl, payload: controls })
            }}
            type="button"
          >
            Reset to defaults
          </button>
        </Modal>
      </button>
    </li>
  )
}

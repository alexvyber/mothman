import { chromeDark, chromeLight, Inspector } from "react-inspector"

import { useState } from "react"

import { logger } from "../../../../../shared/logger"
import { useMothmanContext } from "../../../../utils/global-context"
import { Action, Theme } from "../../../types"
import { Action as ActionIcon } from "../../icons"
import { Modal } from "../../ui/modal"

export function ActionButton() {
  const { dispatch, globalState } = useMothmanContext()
  const [open, setOpen] = useState(false)

  const text = "Log of events triggered by user."

  if (!(globalState.action.length > 0)) {
    return null
  }

  logger.debug(globalState.action)

  return (
    <li>
      <button
        aria-label={text}
        title={text}
        onClick={() => setOpen(true)}
        className={open ? "moth-active" : ""}
        data-testid="addon-action"
        type="button"
      >
        <ActionIcon />
        <span className="moth-addon-tooltip">{text}</span>

        <label>Actions</label>

        <div className="moth-badge">{globalState.action.length}</div>

        <Modal
          maxWidth="60em"
          isOpen={open}
          close={() => setOpen(false)}
          label="Dialog with a log of events triggered by user."
        >
          {globalState.action.map((action, index) => (
            <Inspector
              table={false}
              key={index}
              sortObjectKeys={true}
              theme={
                {
                  ...(globalState.theme === Theme.Light ? chromeLight : chromeDark),
                  BASE_BACKGROUND_COLOR: "var(--moth-bg-color-secondary)",
                } as any
              }
              showNonenumerable={false}
              name={action.name}
              data={action.event}
            />
          ))}

          <button
            onClick={() => dispatch({ type: Action.UpdateAction, payload: { clear: true } })}
            type="button"
          >
            Clear actions
          </button>
        </Modal>
      </button>
    </li>
  )
}

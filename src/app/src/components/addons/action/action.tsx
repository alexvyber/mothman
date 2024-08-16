import { useState } from "react"

import { useMothmanContext } from "../../../../utils/global-context"
import { Action as ActionIcon } from "../../icons"
import { ActionModal } from "./action-modal"

export function ActionButton() {
  const { globalState } = useMothmanContext()
  const [isOpen, setOpen] = useState(false)

  const text = "Log of events triggered by user."

  if (!(globalState.action.length > 0)) {
    return null
  }

  return (
    <>
      <li>
        <button
          aria-label={text}
          title={text}
          onClick={() => setOpen(true)}
          className={isOpen ? "moth-active" : ""}
          data-testid="addon-action"
          type="button"
        >
          <ActionIcon />
          <span className="moth-addon-tooltip">{text}</span>
          <label>Actions</label>
          <div className="moth-badge">{globalState.action.length}</div>
        </button>
      </li>

      <ActionModal
        isOpen={isOpen}
        close={() => setOpen(false)}
      />
    </>
  )
}

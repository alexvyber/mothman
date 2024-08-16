import { useState } from "react"

import { useMothmanContext } from "../../../../utils/global-context"
import { Action as ActionIcon } from "../../icons"
import { AddonTriggerButton } from "../addons-ui"
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
        <AddonTriggerButton
          aria-label={text}
          title={text}
          data-testid="addon-action"
          onClick={() => setOpen(true)}
          className={isOpen ? "moth-active" : ""}
          Icon={ActionIcon}
          label="Actions"
          badge={globalState.action.length}
        />
      </li>

      <ActionModal
        isOpen={isOpen}
        close={() => setOpen(false)}
      />
    </>
  )
}

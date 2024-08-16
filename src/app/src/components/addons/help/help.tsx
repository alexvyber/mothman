import React, { useState } from "react"

import { useMothmanContext } from "../../../../utils/global-context"
import { Help } from "../../icons"
import { Modal } from "../../ui/modal"
import { AddonTooltip } from "../addons-ui"
import { HotKeys } from "./hotkeys"

export function HelpButton() {
  const { globalState } = useMothmanContext()
  const [open, setOpen] = useState(false)

  const text = "Get more information about Mothman."

  return (
    <>
      <li>
        <button
          aria-label={text}
          title={text}
          onClick={() => setOpen(true)}
          className={open ? "moth-active" : ""}
          type="button"
        >
          <Help />

          <AddonTooltip text={text} />

          <label>About Mothman</label>
        </button>
      </li>

      <Modal
        isOpen={open}
        close={() => setOpen(false)}
        label="Dialog with information about Mothman."
      >
        <h3>Hotkeys</h3>

        {globalState.hotkeys && (
          <>
            <ul className="list-none ml-0 pl-0">
              <HotKeys />
            </ul>

            <p>
              Hotkeys can be disabled through <code className="moth-code">{"Story.meta = { hotkeys: false }"}</code>.
            </p>
          </>
        )}

        {!globalState.hotkeys && (
          <p>
            Hotkeys are disabled for this story by <code className="moth-code">meta.hotkeys = false</code>.
          </p>
        )}
      </Modal>
    </>
  )
}

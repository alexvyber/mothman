import { useHotkeys } from "react-hotkeys-hook"

import React from "react"

import { useMothmanContext } from "../../../../utils/global-context"
import config from "../../../../utils/load-config"
import { Action } from "../../../types"
import { Source } from "../../icons"
import { Modal } from "../../ui/modal"
import { AddonTriggerButton } from "../addons-ui"
import { CodeFrame } from "./code-frame"

export function SourceButton() {
  const { globalState, dispatch } = useMothmanContext()

  const text = "Show the story source code."

  useHotkeys(config.hotkeys.source, () => dispatch({ type: Action.UpdateSource, payload: !globalState.source }), {
    enabled: globalState.hotkeys && config.addons.source.enabled,
  })

  return (
    <>
      <li>
        <AddonTriggerButton
          type="button"
          title={text}
          aria-label={text}
          data-testid="addon-source"
          className={globalState.source ? "source-active" : ""}
          onClick={() => dispatch({ type: Action.UpdateSource, payload: !globalState.source })}
          label="Story Source Code"
          icon={Source}
        />
      </li>

      <Modal
        isOpen={globalState.source}
        label="Dialog with the story source code."
        close={() => dispatch({ type: Action.UpdateSource, payload: false })}
      >
        <CodeFrame />
      </Modal>
    </>
  )
}

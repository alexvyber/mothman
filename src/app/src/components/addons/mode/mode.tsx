import { useHotkeys } from "react-hotkeys-hook"

import { defaultConfig } from "../../../../../shared/default-config"
import { useMothmanContext } from "../../../../utils/global-context"
import config from "../../../../utils/load-config"
import { Action, Mode } from "../../../types"
import { Preview } from "../../icons"
import { AddonTriggerButton } from "../addons-ui"

export function ModeButton() {
  const { dispatch, globalState } = useMothmanContext()

  useHotkeys(
    defaultConfig.hotkeys.fullscreen,
    () => {
      const newMode = globalState.mode === Mode.Full ? Mode.Preview : Mode.Full

      dispatch({ type: Action.UpdateMode, payload: newMode })

      document.documentElement.setAttribute("data-mode", newMode)

      globalState.mode === Mode.Preview
        ? document.getElementById("moth-root")?.removeAttribute("class")
        : document.getElementById("moth-root")?.setAttribute("class", "moth-wrapper")
    },
    { preventDefault: true, enabled: globalState.hotkeys && defaultConfig.addons.mode.enabled }
  )

  const text = `Open fullscreen mode. Can be toggled by pressing ${config.hotkeys.fullscreen.join(" or ")}.`

  return (
    <li>
      <AddonTriggerButton
        aria-label={text}
        title={text}
        onClick={() => dispatch({ type: Action.UpdateMode, payload: Mode.Preview })}
        icon={Preview}
        label="Open fullscreen mode"
      />
    </li>
  )
}

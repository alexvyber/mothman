import { useMothmanContext } from "../../../../utils/global-context"
import config from "../../../../utils/load-config"
import { Action, Mode } from "../../../types"
import { Preview } from "../../icons"
import { AddonTriggerButton } from "../addons-ui"

export function ModeButton() {
  const { dispatch } = useMothmanContext()

  const text = `Open fullscreen mode. Can be toggled by pressing ${config.hotkeys.fullscreen.join(" or ")}.`

  return (
    <li>
      <AddonTriggerButton
        aria-label={text}
        title={text}
        onClick={() => dispatch({ type: Action.UpdateMode, payload: Mode.Preview })}
        Icon={Preview}
        label="Open fullscreen mode"
      />
    </li>
  )
}

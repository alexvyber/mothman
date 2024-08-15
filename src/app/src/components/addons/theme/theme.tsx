import { useHotkeys } from "react-hotkeys-hook"

import { useMothmanContext } from "../../../../utils/global-context"
import config from "../../../../utils/load-config"
import { Bulb } from "../../../components/icons"
import { Action, Theme } from "../../../types"

export function ThemeButton() {
  const { globalState, dispatch } = useMothmanContext()

  const darkText = "Switch to dark theme."
  const lightText = "Switch to light theme."

  const changeTheme = () => {
    const newTheme = globalState.theme === Theme.Light ? Theme.Dark : Theme.Light
    document.documentElement.setAttribute("data-theme", newTheme)
    dispatch({ type: Action.UpdateTheme, payload: newTheme })
  }

  useHotkeys(config.hotkeys.darkMode, changeTheme, { enabled: globalState.hotkeys && config.addons.mode.enabled })

  return (
    <li>
      <button
        aria-label={globalState.theme === Theme.Light ? darkText : lightText}
        title={globalState.theme === Theme.Light ? darkText : lightText}
        onClick={changeTheme}
        type="button"
      >
        <Bulb />

        <span className="moth-addon-tooltip">{globalState.theme === Theme.Light ? darkText : lightText}</span>

        <label>Switch to {globalState.theme === Theme.Light ? Theme.Dark : Theme.Light} theme</label>
      </button>
    </li>
  )
}

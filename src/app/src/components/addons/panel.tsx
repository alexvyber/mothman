import config from "../../../utils/load-config"
import { A11YButton } from "./a11y/a11y"
import { ActionButton } from "./action/action"
import { ControlButton } from "./control/control"
import { HelpButton } from "./help/help"
import { ModeButton } from "./mode/mode"
import { SourceButton } from "./source/source"
import { ThemeButton } from "./theme/theme"
import { WidthButton } from "./width/width"

export function AddonPanel() {
  if (Object.values(config.addons).every((addon) => addon.enabled === false)) {
    return null
  }

  return (
    <header className="moth-addons">
      <ul>
        {config.addons.control.enabled && <ControlButton />}
        {config.addons.theme.enabled && <ThemeButton />}
        {config.addons.mode.enabled && <ModeButton />}
        {config.addons.width.enabled && <WidthButton />}
        {config.addons.source.enabled && <SourceButton />}
        {config.addons.a11y.enabled && <A11YButton />}
        {config.addons.action.enabled && <ActionButton />}
        {config.addons.help.enabled && <HelpButton />}
      </ul>
    </header>
  )
}

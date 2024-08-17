import config from "../../../../utils/load-config"

const hotkeyLegends = {
  fullscreen: "Toggle fullscreen mode",
  search: "Focus search input in the sidebar",
  nextStory: "Go to the next story",
  previousStory: "Go to the previous story",
  nextComponent: "Go to the next component",
  previousComponent: "Go to the previous component",
  control: "Toggle controls addon",
  darkMode: "Toggle dark mode",
  width: "Toggle width addon",
  rtl: "Toggle right-to-left mode",
  a11y: "Toggle accessibility addon",
  source: "Toggle story source addon",
}

export function HotKeys() {
  return Object.entries(config.hotkeys).map(
    ([actionKey, actionValue]) =>
      actionValue.length > 0 && (
        <li key={actionKey}>
          <span className="inline-block w-52">
            {actionValue.map((hotkey: string, i: number) => (
              <span key={hotkey}>
                <FormattedHotkey hotkey={hotkey} />
                {actionValue.length > i + 1 ? " or " : ""}
              </span>
            ))}
          </span>

          <span className="inline-block">{hotkeyLegends[actionKey as keyof typeof hotkeyLegends]}</span>
        </li>
      )
  )
}

const FormattedHotkey = ({ hotkey }: { hotkey: string }) => {
  if (navigator.platform.toLowerCase().includes("mac")) {
    hotkey = hotkey.replace(/alt/g, "⌥ opt").replace(/meta/g, "⌘ cmd")
  }

  if (navigator.platform.toLowerCase().includes("win")) {
    hotkey = hotkey.replace(/meta/g, "⊞ win")
  }

  hotkey = hotkey.replace(/shift/g, "⇧ shift")

  hotkey = hotkey
    .replace(/arrowright/g, "→")
    .replace(/arrowleft/g, "←")
    .replace(/arrowup/g, "↑")
    .replace(/arrowdown/g, "↓")
    .replace(/\+/g, " ＋ ")

  return <code className="moth-code">{hotkey}</code>
}

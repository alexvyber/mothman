import React, { useState } from "react"

import { useMothmanContext } from "../../../../utils/global-context"
import config from "../../../../utils/load-config"
import { Help } from "../../icons"
import { Modal } from "../../ui/modal"

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

export const HelpButton = () => {
  const { globalState } = useMothmanContext()
  const [open, setOpen] = useState(false)

  const text = "Get more information about Mothman."

  return (
    <li>
      <button
        aria-label={text}
        title={text}
        onClick={() => setOpen(true)}
        className={open ? "moth-active" : ""}
        type="button"
      >
        <Help />
        <span className="moth-addon-tooltip">{text}</span>
        <label>About Mothman</label>

        <Modal
          isOpen={open}
          close={() => setOpen(false)}
          label="Dialog with information about Mothman."
        >
          <h3>Hotkeys</h3>

          {globalState.hotkeys && (
            <>
              <ul style={{ listStyle: "none", marginLeft: 0, paddingLeft: 0 }}>
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
      </button>
    </li>
  )
}

function HotKeys() {
  return Object.entries(config.hotkeys).map(
    ([actionKey, actionValue]) =>
      actionValue.length > 0 && (
        <li key={actionKey}>
          <span style={{ display: "inline-block", width: "200px" }}>
            {actionValue.map((hotkey: string, i: number) => (
              <span key={hotkey}>
                <FormattedHotkey hotkey={hotkey} />
                {actionValue.length > i + 1 ? " or " : ""}
              </span>
            ))}
          </span>

          <span style={{ display: "inline-block" }}>{hotkeyLegends[actionKey as keyof typeof hotkeyLegends]}</span>
        </li>
      )
  )
}

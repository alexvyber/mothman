import { Action as HistoryAction } from "history"
import { useHotkeys } from "react-hotkeys-hook"
import { errorMessage, stories as sourceStories } from "virtual:stories"

import "./styles.css"

import { useEffect, useReducer, useRef } from "react"

import { defaultConfig } from "../../shared/default-config"
import { getUrlState } from "../utils/get-url-state"
import { GlobalMothmanContext } from "../utils/global-context"
import { globalReducer } from "../utils/global-reducer"
import { history, modifyParams } from "../utils/history"
import { sortStories, storyIdToTitle } from "../utils/story-name"
import { AddonPanel } from "./components/addons/panel"
import { Sidebar } from "./components/sidebar/sidebar"
import { Story } from "./components/story/story"
import { StoryNotFoundError } from "./components/story/story-not-found-error"
import { StorySyntaxError } from "./components/story/story-syntax-error"
import { Action, ControlState, GlobalState, Mode } from "./types"

const stories = sortStories(Object.keys(sourceStories), defaultConfig.storyOrder)

export function App() {
  const [globalState, dispatch] = useReducer(globalReducer, getUrlState(location.search))
  const prevGlobalStateRef = useRef<Partial<GlobalState>>({})

  let customBackground = ""

  if (globalState.control) {
    for (const key of Object.keys(globalState.control)) {
      if (globalState.control[key]?.type === "background") {
        customBackground = globalState.control[key].value || ""
      }
    }
  }

  useEffect(() => {
    // a workaround to allow APIs like action() and linkTo() getting around
    // the context hook limitations
    window.__moth_dispatch = dispatch
  }, [])

  useHotkeys(
    defaultConfig.hotkeys.fullscreen,
    () => dispatch({ type: Action.UpdateMode, payload: globalState.mode === Mode.Full ? Mode.Preview : Mode.Full }),
    { preventDefault: true, enabled: globalState.hotkeys && defaultConfig.addons.mode.enabled }
  )

  useEffect(() => {
    ;(document.getElementById("moth-background") as HTMLDivElement).style.background = customBackground
  }, [customBackground])

  // ???:
  useEffect(() => {
    prevGlobalStateRef.current = globalState
  })

  useEffect(() => {
    // a workaround to allow APIs like action() and linkTo() getting around
    // the context hook limitations
    // @ts-expect-error
    window.mothmanDispatch = dispatch
  }, [])
  const prevGlobalState = prevGlobalStateRef.current

  useEffect(() => {
    // FIX: ???
    // if (!isQueryStorySet(location.search)) modifyParams(globalState)
    modifyParams(globalState)

    if (globalState.story !== prevGlobalState.story) {
      document.title = `${storyIdToTitle(globalState.story)} | moth`
    }

    if (globalState.theme !== prevGlobalState.theme) {
      document.documentElement.setAttribute("data-theme", globalState.theme)
    }

    if (globalState.mode !== prevGlobalState.mode) {
      document.documentElement.setAttribute("data-mode", globalState.mode)

      globalState.mode === Mode.Preview
        ? document.getElementById("moth-root")?.removeAttribute("class")
        : document.getElementById("moth-root")?.setAttribute("class", "moth-wrapper")
    }
  }, [globalState])

  // handle go back/forward browser buttons
  useEffect(() => {
    const unlisten = history.listen(({ location, action }) => {
      if (!(action === HistoryAction.Pop)) {
        return
      }

      const controls = {} as ControlState

      for (const control of Object.keys(globalState.control)) {
        const urlControl = getUrlState(location.search, globalState).control[control]

        controls[control] = {
          ...globalState.control[control],
          value: urlControl ? urlControl.value : globalState.control[control]?.defaultValue,
        }
      }

      const newState = getUrlState(location.search, globalState)

      dispatch({
        type: Action.UpdateAll,
        payload: { ...newState, control: controls, controlInitialized: globalState.story === newState.story },
      })
    })

    return unlisten
  }, [globalState])

  const hasStories = stories.length > 0

  return (
    <GlobalMothmanContext.Provider value={{ globalState, dispatch }}>
      <main className="moth-main">
        {hasStories && !errorMessage && <Story />}
        {hasStories && errorMessage && <StorySyntaxError error={errorMessage} />}
        {!(hasStories || errorMessage) && <StoryNotFoundError />}
      </main>

      <Sidebar stories={stories} />

      <AddonPanel />
    </GlobalMothmanContext.Provider>
  )
}

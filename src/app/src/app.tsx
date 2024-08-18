import "./styles/styles.css"

import { Action as HistoryAction } from "history"
import { errorMessage, stories as sourceStories } from "virtual:stories"

import { useEffect } from "react"

import { defaultConfig } from "../../shared/default-config"
import { getUrlState } from "../utils/get-url-state"
import { useMothmanContext } from "../utils/global-context"
import { history } from "../utils/history"
import { sortStories } from "../utils/story-name"
import { AddonPanel } from "./components/addons/panel"
import { Sidebar } from "./components/sidebar/sidebar"
import { Story } from "./components/story/story"
import { StoryNotFoundError } from "./components/story/story-not-found-error"
import { StorySyntaxError } from "./components/story/story-syntax-error"
import { Action, ControlState } from "./types"

const stories = sortStories(Object.keys(sourceStories), defaultConfig.storyOrder)

export function App() {
  const { globalState, dispatch } = useMothmanContext()

  useEffect(() => {
    // a workaround to allow APIs like action() and linkTo() getting around
    // the context hook limitations
    window.__moth_dispatch = dispatch
  }, [])

  // handle go back/forward browser buttons
  useEffect(() => {
    const unlisten = history.listen(({ location, action }) => {
      if (!(action === HistoryAction.Pop)) return

      const controls = {} as ControlState

      for (const control of Object.keys(globalState.control)) {
        const urlControl = getUrlState(location.search, globalState).control[control]

        Object.assign(controls, {
          [control]: {
            ...globalState.control[control],
            value: urlControl ? urlControl.value : globalState.control[control]?.defaultValue,
          },
        })
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
    <>
      <main className="moth-main flex flex-col">
        {hasStories && !errorMessage && <Story />}
        {hasStories && errorMessage && <StorySyntaxError error={errorMessage} />}
        {!(hasStories || errorMessage) && <StoryNotFoundError />}
      </main>

      <Sidebar stories={stories} />

      <AddonPanel />
    </>
  )
}

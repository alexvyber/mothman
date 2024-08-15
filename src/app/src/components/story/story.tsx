import { stories } from "virtual:stories"

import React, { Suspense, useEffect } from "react"

import { useMothmanContext } from "../../../utils/global-context"
import config from "../../../utils/load-config"
import { Action, Mode } from "../../types"
import { ErrorBoundary } from "../error-boundary"
import { Ring } from "../icons"
import { StoryFrame } from "./story-frame"
import { SynchronizeHead } from "./story-synchronize-head"

export function Story() {
  const { dispatch, globalState } = useMothmanContext()

  const storyData = stories[globalState.story]

  const width = globalState.width
  const storyDataMeta = storyData?.meta?.meta
  const hotkeys = storyDataMeta ? storyDataMeta.hotkeys : true

  const iframeActive: boolean = storyData && storyDataMeta ? storyDataMeta.iframed : false
  let metaWidth = storyData && storyDataMeta ? storyDataMeta.width : 0

  for (const [key, value] of Object.entries(config.addons.width.options))
    key === metaWidth && value && (metaWidth = value)

  useEffect(() => {
    typeof hotkeys !== "undefined" &&
      hotkeys !== globalState.hotkeys &&
      dispatch({ type: Action.UpdateHotkeys, payload: hotkeys })
  }, [hotkeys])

  useEffect(() => {
    const shouldUseMetaWidth = metaWidth && metaWidth !== 0

    shouldUseMetaWidth && dispatch({ type: Action.UpdateWidth, payload: metaWidth })

    !shouldUseMetaWidth &&
      config.addons.width.defaultState !== 0 &&
      dispatch({ type: Action.UpdateWidth, payload: config.addons.width.defaultState })
  }, [metaWidth, globalState.story])

  useEffect(() => {
    globalState.mode !== Mode.Preview && (iframeActive || width)
      ? document.documentElement.setAttribute("data-iframed", `${width}`)
      : document.documentElement.removeAttribute("data-iframed")
  }, [iframeActive, globalState.story, globalState.mode, globalState.width])

  if (!storyData) {
    return null
  }

  return (
    <ErrorBoundary>
      <Suspense fallback={<Ring />}>
        <StoryFrame
          active={iframeActive}
          story={globalState.story}
          width={width}
          mode={globalState.mode}
        >
          {/* <SynchronizeHead
            active={(iframeActive || width > 0) && globalState.mode !== Mode.Preview}
            width={width}
          > */}
          {React.createElement(storyData.component)}
          {/* </SynchronizeHead> */}
        </StoryFrame>
      </Suspense>
    </ErrorBoundary>
  )
}

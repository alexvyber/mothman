import { stories, storySource, StorySourceHeader } from "virtual:stories"

import React, { useEffect } from "react"

import { useMothmanContext } from "../../../../utils/global-context"
import { CodeHighlight } from "./code-highlight"

export function CodeFrame() {
  const { globalState } = useMothmanContext()
  const { entry, locStart, locEnd } = stories[globalState.story]

  useEffect(() => {
    window.location.hash = ""
    window.location.hash = `mothman_loc_${locStart}`
  }, [locStart])

  if (!stories[globalState.story]) {
    return <>There is no story loaded.</>
  }

  return (
    <>
      <StorySourceHeader
        path={entry}
        locStart={locStart}
        locEnd={locEnd}
      />

      <CodeHighlight
        theme={globalState.theme}
        language="tsx"
        locEnd={locEnd}
        locStart={locStart}
        code={decodeURIComponent(storySource[globalState.story])}
      />
    </>
  )
}

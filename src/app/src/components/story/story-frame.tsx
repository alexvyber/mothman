import React from "react"

import { Mode, ModeEnum } from "../../types"
import { Frame } from "../iframe/frame"

type Props = React.PropsWithChildren & {
  active: boolean
  width: number
  mode: ModeEnum
  story: string
}

export function StoryFrame({ children, active, width, story, mode }: Props) {
  if ((!active && width === 0) || mode === Mode.Preview) {
    return children
  }

  return (
    <Frame
      title={`Story ${story}`}
      initialContent={`<!DOCTYPE html><html><head><base target="_parent" /></head><body style="margin:0"><div id="root"></div></body></html>`}
      mountTarget="#root"
      className="moth-iframe"
      style={{ width: width || "100%" }}
    >
      {children}
    </Frame>
  )
}

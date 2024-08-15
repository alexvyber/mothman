import { Context, createContext, useContext } from "react"

let doc: Document | undefined
let win: Window | undefined

if (typeof document !== "undefined") {
  doc = document
}
if (typeof window !== "undefined") {
  win = window
}

const value = { document: doc, window: win }
type FrameContextType = typeof value

const FrameContext: Context<FrameContextType> = createContext<FrameContextType>(value)
const useFrame = (): FrameContextType => useContext(FrameContext)

export { FrameContext, useFrame }

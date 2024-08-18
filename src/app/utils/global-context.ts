import React, { createContext, useContext } from "react"

import { GlobalAction, GlobalState } from "../src/types"

interface GlobalMothmanContextType {
  globalState: GlobalState
  dispatch: React.Dispatch<GlobalAction>
}

export const GlobalMothmanContext: React.Context<GlobalMothmanContextType> = createContext<GlobalMothmanContextType>(
  null as any
)

export function useMothmanContext() {
  return useContext<GlobalMothmanContextType>(GlobalMothmanContext)
}

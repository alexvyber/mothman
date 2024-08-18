import React, { createContext, useContext, useReducer } from "react"

import { GlobalAction, GlobalState } from "../src/types"
import { globalReducer } from "./global-reducer"
import { getUrlState } from "./get-url-state"

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

export function MothmanProvider({ children }: React.PropsWithChildren) {
  const [globalState, dispatch] = useReducer(globalReducer, getUrlState(location.search))

  return <GlobalMothmanContext.Provider value={{ globalState, dispatch }}>{children}</GlobalMothmanContext.Provider>
}

import { Action, GlobalAction, GlobalState } from "../src/types"
import { assertNever } from "./assert-never"

export function globalReducer(state: GlobalState, action: GlobalAction): GlobalState {
  switch (action.type) {
    case Action.UpdateAll:
      return { ...state, ...action.payload }

    case Action.UpdateMode:
      return { ...state, mode: action.payload }

    case Action.UpdateAction: {
      if (!action.payload) {
        return state
      }

      const result = { ...state }

      if (action.payload.clear) {
        result.action = []
        return result
      }

      return { ...state, action: [...result.action, action.payload.value] }
    }

    case Action.UpdateSource:
      return { ...state, source: action.payload }

    case Action.UpdateStory:
      return {
        ...state,
        story: action.payload,
        control: {},
        controlInitialized: false,
        width: 0,
        action: [],
      }

    case Action.UpdateTheme:
      return { ...state, theme: action.payload }

    case Action.UpdateWidth:
      return { ...state, width: action.payload }

    case Action.UpdateControl:
      return { ...state, control: action.payload, controlInitialized: true }

    case Action.UpdateControlIntialized:
      return { ...state, controlInitialized: action.payload }

    case Action.UpdateHotkeys:
      return { ...state, hotkeys: action.payload }

    default:
      assertNever(action)
  }
}

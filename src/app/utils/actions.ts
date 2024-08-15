import { logger } from "../../shared/logger"
import { Action } from "../src/types"

export function linkTo(value: string): () => void {
  const dispatch = window.__moth_dispatch

  if (!dispatch) return () => logger.error("No __moth_dispatch found on widnow object")

  return () => dispatch({ type: Action.UpdateStory, payload: value })
}

export function action(name: string): (event?: unknown) => void {
  const dispatch = window.__moth_dispatch

  if (!dispatch) return () => logger.error("No __moth_dispatch found on widnow object")

  return (event: unknown = undefined) => dispatch({ type: Action.UpdateAction, payload: { value: { name, event } } })
}

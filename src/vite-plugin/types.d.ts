import { Args, ArgTypes, Config, ReactComponent, Stories } from "../app/src/types"

declare module "virtual:stories" {
  export const list: string[]
  export const config: Config
  export const errorMessage: string
  export const args: Args
  export const argTypes: ArgTypes
  export const storySource: Record<string, string>
  export const stories: Stories

  export const StorySourceHeader: ReactComponent<{
    path: string
    locStart: number
    locEnd: number
  }>

  export const Provider: ReactComponent<{
    globalState: GlobalState
    dispatch: React.Dispatch<GlobalAction>
    config: Config
    children: React.ReactElement | string | number | boolean | null | undefined
    storyMeta?: any
  }>
}

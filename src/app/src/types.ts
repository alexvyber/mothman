// TODO: narrow types

import type { UserConfig as ViteUserConfig } from "vite"

import React from "react"

export type ReactComponent<P = {}> = P extends Record<string, any> ? (props: P) => React.ReactElement : never

export type StoryTreeItem = {
  id: string
  subId: string
  name: string
  isLinkable: boolean
  isExpanded: boolean
  isFocused: boolean
  children: StoryTree
}

export type Stories = Record<
  string,
  { entry: string; locStart: number; locEnd: number; component: ReactComponent; meta: any }
>

export type UpdateStory = (story: string) => void

export type StoryTree = StoryTreeItem[]

type DeepPartial<T> = { [P in keyof T]?: DeepPartial<T[P]> }

export type StoryOrder = string[] | ((stories: string[]) => string[])

export type Meta = Record<string, any>

export type Args<P = { [key: string]: any }> = Partial<P>

export type ArgTypes<P = { [key: string]: any }> = {
  [key in keyof P]?: ArgType<P[key]>
}

export interface ArgType<K = any> {
  control?: {
    name?: string
    labels?: { [key: string]: string }
    type: ControlEnum
    min?: number
    max?: number
    step?: number
    [key: string]: any
  }
  mapping?: { [key: string | number]: any }
  options?: K[] | unknown
  defaultValue?: K
  description?: string
  name?: string
  action?: string
  [key: string]: any
}

export const Control = Object.freeze({
  Boolean: "boolean",
  String: "string",
  Number: "number",
  Complex: "complex",
  Function: "function",
  Radio: "radio",
  InlineRadio: "inline-radio",
  Select: "select",
  MultiSelect: "multi-select",
  Check: "check",
  InlineCheck: "inline-check",
  Action: "action",
  Range: "range",
  Background: "background",
})
export type ControlType = typeof Control
export type ControlEnum = (typeof Control)[keyof typeof Control]

export type Story<P = {}> = ReactComponent<P> & {
  meta?: Meta
  storyName?: string
  args?: Args<P>
  argTypes?: ArgTypes<P>
  decorators?: StoryDecorator<P>[]
  parameters?: Record<string, any>
}

export type StoryDecorator<P = {}> = (Story: ReactComponent<Partial<P>>, context: StoryProps) => React.ReactElement

export type SourceHeader = ReactComponent<{
  path: string
  locStart: number
  locEnd: number
}>

export type GlobalProvider = React.FC<{
  globalState: GlobalState
  dispatch: React.Dispatch<GlobalAction>
  config: Config
  children: React.ReactElement | string | number | boolean | null | undefined
  storyMeta?: Meta
}>

export type StoryProps = {
  dispatch: React.Dispatch<GlobalAction>
  globalState: GlobalState
  parameters: { [key: string]: any }
  args: { [key: string]: any }
  argTypes: { [key: string]: any }
}

export type GlobalState = {
  mode: ModeEnum
  theme: ThemeEnum
  action: ActionState
  story: string
  source: boolean
  control: ControlState
  controlInitialized: boolean
  width: number
  hotkeys: boolean
}

export type ControlState = {
  [key: string]: {
    name?: string
    description?: string
    defaultValue?: any
    max?: number
    min?: number
    step?: number
    options?: string[]
    value: any
    type?: ControlEnum
    labels?: { [key: string]: string }
  }
}

export type GlobalAction =
  | { type: ActionType["UpdateAll"]; payload: GlobalState }
  | { type: ActionType["UpdateMode"]; payload: ModeEnum }
  | {
      type: ActionType["UpdateAction"]
      payload: { value: any; clear?: false } | { clear: true }
    }
  | { type: ActionType["UpdateSource"]; payload: boolean }
  | { type: ActionType["UpdateWidth"]; payload: number }
  | { type: ActionType["UpdateStory"]; payload: string }
  | { type: ActionType["UpdateTheme"]; payload: ThemeEnum }
  | { type: ActionType["UpdateHotkeys"]; payload: boolean }
  | { type: ActionType["UpdateControlIntialized"]; payload: boolean }
  | { type: ActionType["UpdateControl"]; payload: ControlState }

export type ActionState = any[]

export type StoryEntry = {
  storyId: string
  componentName: string
  namedExport: string
  locStart: number
  locEnd: number
}

export type ParsedStoriesResult = {
  entry: string
  stories: StoryEntry[]
  exportDefaultProps: { title?: string; meta: any }
  namedExportToMeta: { [key: string]: any }
  namedExportToStoryName: { [key: string]: string }
  storyParams: { [key: string]: { title?: string; meta: any } }
  fileId: string
  storySource: string
}

export type EntryData = {
  [key: string]: ParsedStoriesResult
}

export type GetUserViteConfig = {
  userViteConfig: ViteUserConfig
  hasReactPlugin: boolean
  hasReactSwcPlugin: boolean
  hasTSConfigPathPlugin: boolean
}

export const Action = Object.freeze({
  UpdateAll: "update-all",
  UpdateMode: "update-mode",
  UpdateAction: "update-action",
  UpdateSource: "update-source",
  UpdateStory: "update-story",
  UpdateTheme: "update-theme",
  UpdateWidth: "update-width",
  UpdateControl: "update-control",
  UpdateControlIntialized: "update-control-initialized",
  UpdateHotkeys: "update-hotkeys",
})
export type ActionType = typeof Action
export type ActionTypeEnum = (typeof Action)[keyof typeof Action]

export const Mode = Object.freeze({
  Full: "full",
  Preview: "preview",
})
export type ModeState = typeof Mode
export type ModeEnum = (typeof Mode)[keyof typeof Mode]

export const Theme = Object.freeze({
  Light: "light",
  Dark: "dark",
  Auto: "auto",
})
export type ThemeState = typeof Theme
export type ThemeEnum = (typeof Theme)[keyof typeof Theme]

export interface StoryDefault<P = {}> {
  args?: Args<P>
  argTypes?: ArgTypes<P>
  decorators?: StoryDecorator<P>[]
  meta?: Meta
  title?: string
  parameters?: { [key: string]: any }
}

export type Config = {
  stories: string
  defaultStory: string
  storyOrder: StoryOrder
  appendToHead: string
  disableHttp2: boolean
  viteConfig?: string
  host?: string
  port: number
  previewHost?: string
  previewPort: number
  hmrHost?: string
  hmrPort?: number
  outDir: string
  base?: string
  mode?: string
  noWatch: boolean
  hotkeys: {
    fullscreen: string[]
    search: string[]
    nextStory: string[]
    previousStory: string[]
    nextComponent: string[]
    previousComponent: string[]
    control: string[]
    width: string[]
    a11y: string[]
    source: string[]
    darkMode: string[]
  }
  onDevServerStart: (serverUrl: string) => void
  i18n: { [key: string]: string }
  addons: {
    control: { enabled: boolean; defaultState: ControlState }
    theme: { enabled: boolean; defaultState: ThemeEnum }
    mode: { enabled: boolean; defaultState: ModeEnum }
    action: { enabled: boolean; defaultState: ActionState }
    source: { enabled: boolean; defaultState: boolean }
    help: { enabled: boolean }
    a11y: { enabled: boolean }
    msw: { enabled: boolean }
    width: {
      enabled: boolean
      options: { [key: string]: number }
      defaultState: number
    }
  }
}

export type UserConfig = DeepPartial<Config>

export type CLIParams = Partial<Config> & {
  theme?: ThemeEnum
  config?: string
}

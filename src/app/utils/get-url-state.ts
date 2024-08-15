import { defaultConfig } from "../../shared/default-config"
import { getQuery as getQueryControl } from "../src/components/addons/control/get-query"
import { getQuery as getQueryMode } from "../src/components/addons/mode/get-query"
import { getQuery as getQuerySource } from "../src/components/addons/source/get-query"
import { getQuery as getQueryTheme } from "../src/components/addons/theme/get-query"
import { getQuery as getQueryWidth } from "../src/components/addons/width/get-query"
import { GlobalState } from "../src/types"
import { getQueryStory } from "./story-name"

export function getUrlState(search: string, globalState?: GlobalState): GlobalState {
  return {
    theme: getQueryTheme(search),
    mode: getQueryMode(search),
    story: getQueryStory(search, defaultConfig.defaultStory),
    source: getQuerySource(search),
    width: getQueryWidth(search),
    control: getQueryControl(search, globalState ? globalState.control : {}),
    action: [],
    controlInitialized: false,
    hotkeys: true,
  }
}

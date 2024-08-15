// a separate non-react script, to ensure this is executed asap
import { logger } from "../../shared/logger"
import { getQuery } from "../src/components/addons/theme/get-query"
import { Theme } from "../src/types"
import config from "./load-config"
import { getQueryStory, storyIdToTitle } from "./story-name"

const title = storyIdToTitle(getQueryStory(location.search, config.defaultStory))
logger.debug(`Initial document.title: ${title}`)
document.title = `${title} | Mothman`

const theme = getQuery(location.search)
logger.debug(`Initial theme state: ${theme}`)

if (theme === Theme.Auto) {
  window.matchMedia("(prefers-color-scheme: dark)").matches
    ? document.documentElement.setAttribute("data-theme", Theme.Dark)
    : document.documentElement.setAttribute("data-theme", Theme.Light)
}

if (!(theme === Theme.Auto)) {
  document.documentElement.setAttribute("data-theme", theme)
}

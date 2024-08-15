import queryString from "query-string"
import { capitalize } from "remeda"

import { StoryOrder, StoryTree } from "../src/types"

const storyDelimiter = "-"

function getQueryStory(locationSearch: string, defaultStory: string): string {
  return (queryString.parse(locationSearch).story as string) || defaultStory
}

function storyIdToTitle(str: string): string {
  if (!str) {
    return ""
  }

  return str
    .split(`${storyDelimiter}${storyDelimiter}`)
    .reverse()
    .map((level) => capitalize(level.replace(/-/g, " ")))
    .join(" - ")
}

function getStoryTree(stories: string[], selectedStory: string, allExpanded?: boolean): StoryTree {
  const tree = [] as StoryTree

  const addIntoTree = (_tree: StoryTree, parts: string[], selectedParts: string[], id: string) => {
    const first = parts.shift()

    let isExpanded = !!allExpanded

    let passSelectedParts = [] as string[]

    if (selectedParts[0] === first) {
      passSelectedParts = selectedParts.slice(1)
      isExpanded = true
    }

    const itemIndex = _tree.findIndex((item) => item.subId === first)

    if (!first) {
      return
    }

    if (itemIndex === -1) {
      _tree.push({
        id: `${id}${first}`,
        subId: first,
        name: capitalize(first.replace(/-/g, " ")),
        isLinkable: parts.length === 0,
        isExpanded,
        isFocused: false,
        children: [],
      })
    }

    const children = _tree[itemIndex > -1 ? itemIndex : _tree.length - 1]?.children || []
    addIntoTree(children, parts, passSelectedParts, `${id}${first}--`)
  }

  const selectedStoryPath = selectedStory ? selectedStory.split(`${storyDelimiter}${storyDelimiter}`) : []

  for (const story of stories) {
    const storyPath = story.split(`${storyDelimiter}${storyDelimiter}`)
    addIntoTree(tree, storyPath, selectedStoryPath, "")
  }

  return tree
}

// alphabetically sort stories but prefering "folders" over leaf nodes
function storySort(a: string, b: string): 0 | -1 | 1 {
  const aParts = a.split("--")
  const bParts = b.split("--")

  const len = Math.min(aParts.length, bParts.length)

  for (let i = 0; i < len; i++) {
    if (aParts[i] !== bParts[i]) {
      if (!aParts[i + 1] && bParts[i + 1]) {
        return 1
      }

      if (aParts[i + 1] && !bParts[i + 1]) {
        return -1
      }

      if ([aParts[i], bParts[i]].sort()[0] === aParts[i]) {
        return -1
      }

      return 1
    }
  }

  return 0
}

function sortStories(stories: string[], storyOrder: StoryOrder): string[] {
  const initialSort = stories.sort(storySort)

  let configSort = [...initialSort]

  if (Array.isArray(storyOrder)) {
    configSort = storyOrder
  } else {
    configSort = storyOrder(initialSort)
  }

  const finalSort = new Set<string>()

  for (const storyOrig of configSort) {
    const story = storyOrig.toLowerCase()

    if (story.includes("*")) {
      const prefix = story.split("*")[0]

      for (const story of initialSort) {
        if (prefix && story.startsWith(prefix)) {
          finalSort.add(story)
        }
      }
    } else {
      if (!initialSort.includes(story)) {
        throw new Error(`Story "${storyOrig}" does not exist in your storybook. Please check your storyOrder config.`)
      }

      finalSort.add(story)
    }
  }

  return [...finalSort]
}

export { sortStories, getStoryTree, storyIdToTitle, getQueryStory }

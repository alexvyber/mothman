import { EntryData, StoryEntry } from "../../app/src/types.js"
import { storyIdToMeta } from "../utils.js"

export function getMetaJson(entryData: EntryData) {
  const storyIds = [] as string[]
  const storyParams = {} as Record<string, any>
  const storyMeta = {} as Record<string, any>

  for (const [filePath, story] of Object.entries(entryData)) {
    for (const { storyId, locStart, locEnd, namedExport } of Object.values(story.stories)) {
      Object.assign(storyMeta, { [storyId]: { filePath, locStart, locEnd, namedExport } })
      storyIds.push(storyId)
    }

    Object.assign(storyParams, story.storyParams)
  }

  const result = {
    stories: {} as Record<string, StoryEntry>,
  }

  for (const storyId of storyIds) {
    Object.assign(result.stories, {
      [storyId]: {
        ...storyIdToMeta(storyId),
        ...storyMeta[storyId],
        meta: storyParams[storyId] ? storyParams[storyId].meta : {},
      },
    })
  }

  return result
}

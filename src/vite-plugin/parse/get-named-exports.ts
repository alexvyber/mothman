import { kebabCase } from "change-case"
import { clone, merge } from "remeda"

import { ParsedStoriesResult, StoryEntry } from "../../app/src/types.js"
import { getEncodedStoryName, storyDelimiter, titleToFileId } from "../utils.js"

export function getNamedExports(
  {
    fileId,
    exportDefaultProps,
    namedExportToMeta,
    namedExportToStoryName,
    storyParams,
    stories,
    entry,
  }: ParsedStoriesResult,
  astPath: any
): void {
  const namedExportToStory = (namedExportDeclaration: any, namedExport: string): StoryEntry => {
    if (namedExport.includes("__")) {
      throw new Error(
        `Story named ${namedExport} can't contain "__". It's reserved for internal encoding. Please rename this export.`
      )
    }

    let storyNamespace = fileId
    if (exportDefaultProps?.title) {
      storyNamespace = titleToFileId(exportDefaultProps.title)
    }

    const storyName = namedExportToStoryName[namedExport] ? namedExportToStoryName[namedExport] : namedExport
    const storyId = `${kebabCase(storyNamespace)}${storyDelimiter}${storyDelimiter}${kebabCase(storyName)}`

    // attach default meta to each story
    if (exportDefaultProps?.meta) {
      Object.assign(storyParams, { [storyId]: exportDefaultProps })
    }

    // add and merge story specific meta
    if (namedExportToMeta[namedExport]) {
      Object.assign(storyParams, {
        [storyId]: merge(clone(storyParams[storyId] || {}), { meta: namedExportToMeta[namedExport] }),
      })
    }

    const componentName = getEncodedStoryName(kebabCase(storyNamespace), kebabCase(storyName))

    const story = {
      storyId,
      componentName,
      namedExport,
      locStart: namedExportDeclaration.loc.start.line,
      locEnd: namedExportDeclaration.loc.end.line,
    }

    return story
  }

  // Inline exports, such as: export const Story = () => <h1>Export List</h1>;
  if (astPath.node?.declaration?.type) {
    let namedExport = ""

    const namedExportDeclaration = astPath.node?.declaration

    if (namedExportDeclaration.type === "ClassDeclaration") {
      namedExport = namedExportDeclaration.id.name
    } else if (namedExportDeclaration.type === "VariableDeclaration") {
      namedExport = namedExportDeclaration.declarations[0].id.name
    } else if (namedExportDeclaration.type === "FunctionDeclaration") {
      namedExport = namedExportDeclaration.id.name
    } else {
      throw new Error(`Named export in ${entry} must be variable, class or function.`)
    }

    const story = namedExportToStory(namedExportDeclaration, namedExport)

    stories.push(story)
  } else if (astPath.node?.specifiers.length > 0) {
    // It's an export block export, such as: { story, story as storyRenamed };
    for (const specifier of astPath.node?.specifiers ?? []) {
      const namedExport = specifier.exported.name
      const story = namedExportToStory(specifier, namedExport)
      stories.push(story)
    }
  }
}

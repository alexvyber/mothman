import t from "@babel/types"
import { EntryData } from "../../app/src/types.js"
import { generate, template } from "../babel/babel.js"
import { storyDelimiter, storyEncodeDelimiter } from "../utils.js"

export function getStoryList(entryData: EntryData): string {
  const storyIds = [] as string[]
  const storyParams = {} as Record<string, any>
  const storyLocs = {} as Record<string, { locStart: number; locEnd: number; entry: string }>

  for (const [filePath, entry] of Object.entries(entryData)) {
    for (const { storyId, locStart, locEnd } of entry.stories) {
      storyIds.push(storyId)
      storyLocs[storyId] = { locStart, locEnd, entry: filePath }
    }
    Object.assign(storyParams, entry.storyParams)
  }

  const output = generate(
    t.exportNamedDeclaration(
      t.variableDeclaration("let", [
        t.variableDeclarator(
          t.identifier("stories"),
          t.objectExpression(
            storyIds.map((story) => {
              let paramsAst = null

              if (storyParams[story]) {
                paramsAst = t.objectProperty(
                  t.identifier("meta"),
                  template.ast(`const foo = ${JSON.stringify(storyParams[story])}`).declarations[0].init
                )
              }

              return t.objectProperty(
                t.stringLiteral(story),
                t.objectExpression([
                  t.objectProperty(
                    t.identifier("component"),
                    t.identifier(story.replace(new RegExp(storyDelimiter, "g"), storyEncodeDelimiter))
                  ),

                  t.objectProperty(t.identifier("locStart"), t.numericLiteral(storyLocs[story].locStart)),
                  t.objectProperty(t.identifier("locEnd"), t.numericLiteral(storyLocs[story].locEnd)),
                  t.objectProperty(t.identifier("entry"), t.stringLiteral(storyLocs[story].entry)),

                  ...(paramsAst ? [paramsAst] : []),
                ])
              )
            })
          )
        ),
      ])
    )
  )

  return output.code
}

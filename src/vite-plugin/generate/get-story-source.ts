import { createHash } from "node:crypto"

import t from "@babel/types"
import { EntryData } from "../../app/src/types.js"
import { generate } from "../babel/babel.js"

export function getStorySource(entryData: EntryData, enabled: boolean): string {
  if (!enabled) {
    return "export const storySource = {}"
  }

  const fileSourceCodes = {} as Record<string, string>
  const storySource = {} as Record<string, string>

  for (const entry of Object.values(entryData)) {
    const fileHash = createHash("sha256").update(entry.storySource, "utf8").digest("hex").slice(0, 8)

    Object.assign(fileSourceCodes, { [fileHash]: entry.storySource })

    for (const { storyId } of entry.stories) {
      Object.assign(storySource, { [storyId]: fileHash })
    }
  }

  const fileSources = generate(
    t.variableDeclaration("let", [
      t.variableDeclarator(
        t.identifier("fileSourceCodes"),
        t.objectExpression(
          Object.keys(fileSourceCodes).map((fileHash) =>
            t.objectProperty(
              t.stringLiteral(fileHash),
              t.templateLiteral(
                [
                  t.templateElement(
                    {
                      raw: encodeURIComponent(fileSourceCodes[fileHash] as string),
                      cooked: encodeURIComponent(fileSourceCodes[fileHash] as string),
                    },
                    true
                  ),
                ],
                []
              )
            )
          )
        )
      ),
    ])
  )

  const storyToSource = generate(
    t.exportNamedDeclaration(
      t.variableDeclaration("let", [
        t.variableDeclarator(
          t.identifier("storySource"),
          t.objectExpression(
            Object.keys(storySource).map((storyId) =>
              t.objectProperty(t.stringLiteral(storyId), t.identifier(`fileSourceCodes["${storySource[storyId]}"]`))
            )
          )
        ),
      ])
    )
  )

  return `${fileSources.code}\n${storyToSource.code}\n`
}

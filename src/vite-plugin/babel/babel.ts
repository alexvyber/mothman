import bableGenerate from "@babel/generator"
import babelTemplate from "@babel/template"
import babelTraverse from "@babel/traverse"

// Fixes `TypeError: traverse | template | generator is not a function`

export const traverse: typeof babelTraverse =
  typeof babelTraverse === "function"
    ? babelTraverse
    : // @ts-expect-error
      babelTraverse.default

export const template =
  typeof babelTemplate === "function"
    ? babelTemplate
    : // @ts-expect-error
      babelTemplate.default

export const generate =
  typeof bableGenerate === "function"
    ? bableGenerate
    : // @ts-expect-error
      bableGenerate.default

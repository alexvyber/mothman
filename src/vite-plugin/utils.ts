import { capitalize } from "remeda"

export const storyDelimiter = "-"
export const storyEncodeDelimiter = "$"

export function storyIdToMeta(str: string): { name: string; levels: string[] } {
  const parts = str.split(`${storyDelimiter}${storyDelimiter}`).map((level) => capitalize(level.replace(/-/g, " ")))

  return { name: parts.pop()!, levels: parts }
}

// preserving delimiters --
const wordSeparators = /[\s\u2000-\u206F\u2E00-\u2E7F\\'!"#$%&()*+,.\/:;<=>?@\[\]^_`{|}~]+/
//
const replace = /[A-Z\u00C0-\u00D6\u00D9-\u00DD]+(?![a-z])|[A-Z\u00C0-\u00D6\u00D9-\u00DD]/g
export function customKebabCase(str: string): string {
  return str
    .replace(replace, ($, ofs) => (ofs ? "-" : "") + $.toLowerCase())
    .replace(/\s-/g, "-")
    .trim()
    .split(wordSeparators)
    .join("-")
}

export function titleToFileId(title: string) {
  return title
    .toLocaleLowerCase()
    .replace(/\s*\/\s*/g, `${storyDelimiter}${storyDelimiter}`)
    .replace(/\s+/g, storyDelimiter)
}

export function getFileId(filename: string): string {
  const pathParts = filename.split("/")
  return pathParts[pathParts.length - 1]?.split(".")[0] || ""
}

export function getEncodedStoryName(fileId: string, namedExport: string) {
  return `${fileId}${storyEncodeDelimiter}${storyEncodeDelimiter}${namedExport}`
    .toLocaleLowerCase()
    .replace(new RegExp(storyDelimiter, "g"), storyEncodeDelimiter)
}

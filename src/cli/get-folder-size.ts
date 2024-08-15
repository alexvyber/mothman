import { readdirSync, statSync } from "node:fs"
import { join } from "node:path"

export function getFolderSize(directoryPath: string): string {
  const arrayOfFiles = getAllFiles(directoryPath)

  let totalSize = 0

  for (const filePath of arrayOfFiles) {
    totalSize += statSync(filePath).size
  }

  return Number(totalSize / 1024 / 1024).toFixed(2)
}

function getAllFiles(dirPath: string, arrayOfFiles: string[] = []): string[] {
  const files = readdirSync(dirPath)

  for (const file of files) {
    const isDir = statSync(`${dirPath}/${file}`).isDirectory()

    if (isDir) {
      arrayOfFiles = getAllFiles(`${dirPath}/${file}`, arrayOfFiles)
    }

    if (!isDir) {
      arrayOfFiles.push(join(dirPath, file))
    }
  }

  return arrayOfFiles
}

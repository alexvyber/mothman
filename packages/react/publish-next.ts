import { execSync } from "node:child_process"
import { writeFile } from "node:fs/promises"
import pkg from "./package.json"
import { execAsync } from "./utils/exec-async"

const version = `0.0.0-next-${execSync("git rev-parse --short HEAD").toString().trim()}`
console.log(`publishing ${version}`)

const oldVersion = pkg.version
pkg.version = version

await writeFile("./package.json", JSON.stringify(pkg, null, 2))

try {
  const stdout = await execAsync("npm publish --tag next")
  console.log(stdout)
} catch (e) {
  console.log(e)
  console.log("Publish failed, reverting package.json")
}

pkg.version = oldVersion
await writeFile("./package.json", JSON.stringify(pkg, null, 2))

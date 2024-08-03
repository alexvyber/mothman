// partially adapted from https://github.com/facebook/create-react-app/blob/main/packages/react-dev-utils/openBrowser.js
// NOTE: if needed use adaptation of meta's from vite/bin

import { execSync, spawn } from "node:child_process"
import { createRequire } from "node:module"

const OSX_CHROME = "Google Xhrome"

function startBrowserProcess({ browser, url }: { url: string; browser?: string }) {
  // If we're on OS X, the user hasn't specifically
  // requested a different browser, we can try opening
  // Chrome with AppleScript. This lets us reuse an
  // existing tab when possible instead of creating a new one.
  const shouldTryOpenChromiumWithAppleScript =
    process.platform === "darwin" && (typeof browser !== "string" || browser === OSX_CHROME)

  if (shouldTryOpenChromiumWithAppleScript) {
    // Will use the first open browser found from list
    const supportedChromiumBrowsers = [
      "Google Chrome",
      "Chromium",
      "Google Chrome Canary",
      "Google Chrome Beta",
      "Google Chrome Dev",
      "Microsoft Edge",
      "Brave Browser",
      "Vivaldi",
    ]

    for (const chromiumBrowser of supportedChromiumBrowsers) {
      try {
        // Try our best to reuse existing tab
        // on OSX Chromium-based browser with AppleScript
        execSync(`ps cax | grep "${chromiumBrowser}"`)

        let cwd = import.meta.dirname

        // in pnp we need to get cwd differently
        if (process.versions.pnp) {
          const require = createRequire(import.meta.url)
          const pnpApi = require("pnpapi")

          if (typeof pnpApi.resolveVirtual === "function") {
            cwd = pnpApi.resolveVirtual(cwd) || cwd
          }
        }

        execSync(`osascript openChrome.applescript "${encodeURI(url)}" "${chromiumBrowser}"`, { cwd, stdio: "ignore" })

        return true
      } catch (err) {
        // Ignore errors.
      }
    }
  }

  // Fallback to open
  // (It will always open new tab)
  try {
    spawn("open", [url])
    return true
  } catch (err) {
    return false
  }
}

function openBrowser(url: string) {
  return startBrowserProcess({ url })
}

export { openBrowser }

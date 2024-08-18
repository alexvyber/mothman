import { createRoot } from "react-dom/client"

import React from "react"

import { App } from "./src/app"
import { MothmanProvider } from "./utils/global-context"

const root = createRoot(document.getElementById("moth-root")!)
root.render(
  <MothmanProvider>
    <App />
  </MothmanProvider>
)

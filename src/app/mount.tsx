import { createRoot } from "react-dom/client"

import React from "react"

import { App } from "./src/app"

const root = createRoot(document.getElementById("moth-root")!)
root.render(<App />)

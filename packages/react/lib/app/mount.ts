import { createRoot } from "react-dom/client"
import { createApp } from "./src/app"

const root = createRoot(document.getElementById("root")!)
root.render(createApp())

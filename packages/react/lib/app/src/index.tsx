import * as ReactDOMClient from "react-dom/client"

const container = document.getElementById("root") as HTMLElement
const root = ReactDOMClient.createRoot(container)

root.render(<App />)

function App() {
  return <></>
}

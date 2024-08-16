import { useState } from "react"

import { ViolationType } from "./types"

export const Violation = ({ violation }: { violation: ViolationType }) => {
  const [more, setMore] = useState(false)

  return (
    <li>
      {violation.help} ({violation.nodes.length}).{" "}
      {!more && (
        <a
          href="#"
          onClick={() => setMore(true)}
        >
          Show details
        </a>
      )}
      {more && (
        <>
          <ul>
            <li>ID: {violation.id}</li>
            <li>Impact: {violation.impact}</li>
            <li>Description: {violation.description}</li>
            <li>
              <a href={violation.helpUrl}>Documentation</a>
            </li>
          </ul>
          <p>Violating nodes:</p>
          <ul>
            {violation.nodes.map((node) => (
              <li key={node.html}>
                <code className="moth-code">{node.html}</code>
              </li>
            ))}
          </ul>
          <p>
            <a
              href="#"
              onClick={() => setMore(false)}
            >
              Hide details
            </a>
          </p>
        </>
      )}
    </li>
  )
}

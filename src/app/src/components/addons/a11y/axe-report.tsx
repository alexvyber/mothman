import { ViolationType } from "./types"
import { Violation } from "./violation"

export function AxeReport({ reportFinished, violations }: { reportFinished: boolean; violations: ViolationType[] }) {
  if (!reportFinished) return <p>Report is loading...</p>

  if (violations.length === 0) {
    return (
      <p>
        There are no <a href="https://github.com/dequelabs/axe-core">axe</a> accessibility violations. Good job!
      </p>
    )
  }

  return (
    <>
      <h3>
        There are {violations.length} <a href="https://github.com/dequelabs/axe-core">axe</a> accessibility violations
      </h3>
      <ul>
        {violations.map((violation) => (
          <Violation
            key={violation.id}
            violation={violation}
          />
        ))}
      </ul>
    </>
  )
}

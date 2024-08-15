import { useHotkeys } from "react-hotkeys-hook"

import React, { useEffect, useState } from "react"

import { logger } from "../../../../../shared/logger"
import { useMothmanContext } from "../../../../utils/global-context"
import config from "../../../../utils/load-config"
import { watchers } from "../../../../utils/story-hmr"
import { A11y } from "../../icons"
import { Modal } from "../../ui/modal"

type ViolationType = {
  id: string
  impact: string
  description: string
  help: string
  helpUrl: string
  nodes: { html: string }[]
}

async function runAxe(
  setViolations: React.Dispatch<React.SetStateAction<ViolationType[]>>,
  setReportFinished: React.Dispatch<React.SetStateAction<boolean>>,
  element: HTMLElement | null
) {
  const axe = await import("axe-core")

  try {
    const results = await axe.default.run(document.getElementsByTagName("main") as any)
    setViolations(results.violations as ViolationType[])
    setReportFinished(true)
    if (element) element.setAttribute("aria-hidden", "true")
  } catch (error) {
    // do nothing
  }
}

const Violation = ({ violation }: { violation: ViolationType }) => {
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

const AxeReport = ({ reportFinished, violations }: { reportFinished: boolean; violations: ViolationType[] }) => {
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

export const A11YButton = () => {
  const { globalState } = useMothmanContext()

  const [showReport, setShowReport] = useState(false)
  const [reportFinished, setReportFinished] = useState(false)
  const [violations, setViolations] = useState<ViolationType[]>([])

  useEffect(() => {
    // re-run Axe on HMR updates, some timeout is needed to let the DOM settle
    watchers.push(() => {
      setTimeout(() => {
        const root = document.getElementById("moth-root") as HTMLElement

        // Addon Dialog aria hides the rest of page, we need to temporarily
        // make it visible for Axe function properly
        root.removeAttribute("aria-hidden")

        runAxe(setViolations, setReportFinished, root).catch(logger.error)
      }, 50)
    })
  }, [])

  const text = "Show accessibility report."

  const openReport = () => {
    runAxe(setViolations, setReportFinished, null).catch(logger.error)

    // We give 100ms for axe to finish before displaying "Loading..."
    // inside of the dialog. Makes the UI transition to less jarring.
    setTimeout(() => setShowReport(!showReport), 100)
  }

  useHotkeys(config.hotkeys.a11y, () => (showReport ? setShowReport(false) : openReport()), {
    enabled: globalState.hotkeys && config.addons.a11y.enabled,
  })

  return (
    <li>
      <button
        aria-label={text}
        data-testid="addon-a11y"
        title={text}
        onClick={openReport}
        className={showReport ? "a11y-active" : ""}
        type="button"
      >
        <A11y />

        <span className="moth-addon-tooltip">{text}</span>

        <label>Accessibility report</label>

        {violations.length ? <div className="moth-badge">{violations.length}</div> : null}

        <Modal
          isOpen={showReport}
          close={() => setShowReport(false)}
          label="Dialog with the story accessibility report."
        >
          <AxeReport
            reportFinished={reportFinished}
            violations={violations}
          />
        </Modal>
      </button>
    </li>
  )
}

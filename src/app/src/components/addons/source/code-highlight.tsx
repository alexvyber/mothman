import { Highlight, themes } from "prism-react-renderer"
import type { Language, PrismTheme } from "prism-react-renderer"

import { Theme } from "../../../types"

interface Props {
  code: string
  theme: string
  language?: Language
  locStart?: number
  locEnd?: number
  className?: string
}

export function CodeHighlight({ code, theme, language = "tsx", locStart, locEnd, className }: Props) {
  const withLoc = typeof locStart !== "undefined" && typeof locEnd !== "undefined"

  const match = /language-(\w+)/.exec(className || "")

  const themeProp = {
    ...(theme === Theme.Dark ? themes.nightOwl : themes.github),
    plain: {
      ...(theme === Theme.Dark ? themes.nightOwl : themes.github).plain,
      backgroundColor: "var(--moth-bg-color-secondary)",
    },
  } satisfies PrismTheme

  if (match) {
    language = match[1] as Language

    return (
      <Highlight
        code={code.trim()}
        language={language}
        theme={themeProp}
        children={({ className, style, tokens, getTokenProps }) => (
          <div
            className={className}
            style={{ ...style, textAlign: "left", margin: "0.5em 0 1em 0", padding: "1em" }}
          >
            {tokens.map((line, i) => (
              <div key={i}>
                {line.map((token, key) => (
                  <span
                    key={key}
                    {...getTokenProps({ token, key })}
                  />
                ))}
              </div>
            ))}
          </div>
        )}
      />
    )
  }

  if (withLoc) {
    return (
      <Highlight
        code={code.trim()}
        language={language}
        theme={themeProp}
        children={({ className, style, tokens, getLineProps, getTokenProps }) => (
          <pre
            className={className}
            style={{
              ...style,
              textAlign: "left",
              margin: "0.5em 0 1em 0",
              padding: "1em 0",
              overflow: "auto",
              maxHeight: "50vh",
            }}
          >
            {tokens.map((line, i) => (
              <div
                key={i}
                id={`mothman_loc_${i + 1}`}
                {...getLineProps({ line, key: i })}
                className="table-row"
              >
                <span
                  className="moth-addon-source-lineno"
                  style={
                    i + 1 >= locStart && i + 1 <= locEnd
                      ? { backgroundColor: "var(--moth-color-accent)", color: "#FFF" }
                      : undefined
                  }
                >
                  {i + 1}
                </span>
                <div className="table-cell pl-2">
                  {line.map((token, key) => (
                    <span
                      key={key}
                      {...getTokenProps({ token, key })}
                    />
                  ))}
                </div>
              </div>
            ))}
          </pre>
        )}
      />
    )
  }

  return <code>{code}</code>
}

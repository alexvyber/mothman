import { logger } from "../../../../shared/logger"

export function StorySyntaxError({ error }: { error: string }) {
  logger.error(`Error parsing stories: ${error}`)

  return (
    <div className="moth-error-content">
      <h1>SyntaxError when parsing stories ❌</h1>

      <pre>{error}</pre>

      <p>Check the terminal for more info.</p>
      <p>
        <a href="https://moth.dev/docs/stories#limitations">More information.</a>
      </p>
      <p>
        <strong>Please restart Mothman after fixing this issue.</strong>
      </p>
      <p>
        <a href="https://github.com/tajo/moth">Github</a>
      </p>
      <p>
        <a href="https://www.moth.dev">Docs</a>
      </p>
    </div>
  )
}

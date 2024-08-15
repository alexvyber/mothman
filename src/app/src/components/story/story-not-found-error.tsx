import { config } from "virtual:stories"

export const StoryNotFoundError = () => (
  <div className="moth-error-content">
    <h1>No stories found</h1>
    <p>
      The configured glob pattern for stories is: <code className="moth-code">{config.stories}</code>.
    </p>
    <p>
      It can be changed through the <a href="https://www.moth.dev/docs/config#story-filenames">configuration file</a> or
      CLI flag
      <code className="moth-code">--stories=your-glob</code>.
    </p>
    <p>
      <a href="https://github.com/tajo/moth">GitHub</a>
    </p>
    <p>
      <a href="https://www.moth.dev">Docs</a>
    </p>
  </div>
)

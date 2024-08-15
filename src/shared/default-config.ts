import { Config } from "../app/src/types"

export const defaultConfig: Config = Object.freeze({
  stories: "src/**/*.stories.{js,jsx,ts,tsx,mdx}",
  defaultStory: "",
  viteConfig: undefined,
  appendToHead: "",
  disableHttp2: false,
  noWatch: false,
  port: 42069,
  previewPort: 6969,
  hmrHost: undefined,
  hmrPort: undefined,
  outDir: "build",
  base: undefined,

  hotkeys: {
    search: ["/", "meta+p"],
    nextStory: ["alt+arrowright"],
    previousStory: ["alt+arrowleft"],
    nextComponent: ["alt+arrowdown"],
    previousComponent: ["alt+arrowup"],
    control: ["c"],
    darkMode: ["d"],
    fullscreen: ["f"],
    width: ["w"],
    source: ["s"],
    a11y: ["a"],
  },

  storyOrder: (stories) => stories,
  onDevServerStart: () => undefined,

  i18n: { buildTooltip: '💡 Tip: Run "moth preview" to check that the build works!' },

  addons: {
    control: { enabled: true, defaultState: {} },
    theme: { enabled: true, defaultState: "light" },
    mode: { enabled: true, defaultState: "full" },
    source: { enabled: true, defaultState: false },
    a11y: { enabled: true },
    msw: { enabled: true },
    help: { enabled: true },
    action: { enabled: true, defaultState: [] },
    width: {
      enabled: true,
      options: { xss: 320, xs: 480, sm: 640, md: 768, lg: 1024, xl: 1280 },
      defaultState: 0,
    },
  },
} satisfies Config)

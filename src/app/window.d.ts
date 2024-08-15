import type { SetupWorker } from "msw/browser"

declare global {
  interface Window {
    __moth_msw: SetupWorker
    __moth_dispatch: React.Dispatch<GlobalAction> | undefined
  }
}

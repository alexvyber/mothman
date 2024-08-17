import type { RequestHandler } from "msw"

import React, { useEffect, useState } from "react"

interface Props extends React.PropsWithChildren {
  msw: RequestHandler[]
}

export function Msw({ children, msw }: Props) {
  const [ready, setReady] = useState(false)

  useEffect(() => {
    const initMsw = async () => {
      if (msw.length === 0) return

      const { setupWorker } = await import("msw/browser")

      if (!window.__moth_msw) {
        window.__moth_msw = setupWorker()
        window.__moth_msw.use(...msw)

        await window.__moth_msw.start({
          serviceWorker: { url: `${(import.meta as any).env.BASE_URL}mockServiceWorker.js` },
        })

        setReady(true)
      }

      if (window.__moth_msw) {
        window.__moth_msw.use(...msw)
        setReady(true)
      }
    }

    initMsw()

    return () => window.__moth_msw?.resetHandlers()
  }, [msw])

  if (msw.length === 0) return children

  if (!ready) return null

  return children
}

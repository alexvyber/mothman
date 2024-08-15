import React from "react"

import { logger } from "../../../shared/logger"

export class ErrorBoundary extends React.Component<React.PropsWithChildren, { hasError: boolean }> {
  constructor(props: React.PropsWithChildren) {
    super(props)
    this.state = { hasError: false }
  }

  static getDerivedStateFromError() {
    return { hasError: true }
  }

  override componentDidCatch(error: Error) {
    logger.error(error)
  }

  override render() {
    if (this.state.hasError) {
      return null
    }

    return this.props.children
  }
}

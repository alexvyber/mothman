import ReactDOM from "react-dom"

import React, { Component, createRef, forwardRef } from "react"

import Content from "./content"
import { FrameContext } from "./context"

interface FrameProps extends Pick<React.HTMLAttributes<HTMLElement>, "style" | "className" | "children"> {
  title: string
  head?: React.ReactNode
  initialContent?: string
  mountTarget?: string
  contentDidMount?: () => void
  contentDidUpdate?: () => void
  forwardedRef?: React.ForwardedRef<HTMLIFrameElement>
}

interface FrameState {
  iframeLoaded: boolean
}

class FrameComponent extends Component<FrameProps, FrameState> {
  static defaultProps = {
    style: {},
    head: null,
    children: undefined,
    mountTarget: undefined,
    contentDidMount: () => {},
    contentDidUpdate: () => {},
    initialContent: '<!DOCTYPE html><html><head></head><body><div class="frame-root"></div></body></html>',
  }

  private _isMounted = false
  private nodeRef = createRef<HTMLIFrameElement>()

  constructor(props: FrameProps) {
    super(props)
    this.state = { iframeLoaded: false }
  }

  override componentDidMount() {
    this._isMounted = true

    const doc = this.getDoc()
    if (doc && doc.readyState === "complete") {
      this.forceUpdate()
    } else {
      this.nodeRef.current?.addEventListener("load", this.handleLoad)
    }
  }

  override componentWillUnmount() {
    this._isMounted = false
    this.nodeRef.current?.removeEventListener("load", this.handleLoad)
  }

  getDoc() {
    return this.nodeRef.current ? this.nodeRef.current.contentDocument : null
  }

  getMountTarget() {
    const doc = this.getDoc()
    if (this.props.mountTarget) {
      return doc?.querySelector(this.props.mountTarget)
    }
    return doc?.body.children[0]
  }

  setRef = (node: HTMLIFrameElement) => {
    // @ts-expect-error
    this.nodeRef.current = node

    const forwardedRef = this.props.forwardedRef

    if (typeof forwardedRef === "function") {
      forwardedRef(node)
    } else if (forwardedRef) {
      forwardedRef.current = node
    }
  }

  handleLoad = () => {
    this.setState({ iframeLoaded: true })
  }

  renderFrameContents() {
    if (!this._isMounted) {
      return null
    }

    const doc = this.getDoc()

    if (!doc) {
      return null
    }

    const contentDidMount = this.props.contentDidMount
    const contentDidUpdate = this.props.contentDidUpdate

    const win = doc.defaultView || (doc as any).parentView
    const contents = (
      <Content
        contentDidMount={contentDidMount}
        contentDidUpdate={contentDidUpdate}
      >
        <FrameContext.Provider value={{ document: doc, window: win }}>
          <div className="frame-content">{this.props.children}</div>
        </FrameContext.Provider>
      </Content>
    )

    const mountTarget = this.getMountTarget()

    return [
      ReactDOM.createPortal(this.props.head, (this.getDoc() as any).head),
      ReactDOM.createPortal(contents, mountTarget as Element),
    ]
  }

  override render() {
    const passOnlyProps = Object.assign(
      {},
      { srcDoc: this.props.initialContent },
      {
        className: this.props.className,
        style: this.props.style,
        title: this.props.title,
      }
    )

    return (
      <iframe
        {...passOnlyProps}
        ref={this.setRef}
        onLoad={this.handleLoad}
      >
        {this.state.iframeLoaded && this.renderFrameContents()}
      </iframe>
    )
  }
}

export const Frame = forwardRef<HTMLIFrameElement, FrameProps>((props, ref) => (
  <FrameComponent
    {...props}
    forwardedRef={ref as any}
  />
))

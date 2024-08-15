import React from "react"

interface ContentProps extends React.PropsWithChildren {
  contentDidMount?: () => void
  contentDidUpdate?: () => void
}

export default class Content extends React.Component<ContentProps> {
  override componentDidMount() {
    this.props.contentDidMount?.()
  }

  override componentDidUpdate() {
    this.props.contentDidUpdate?.()
  }

  override render() {
    return React.Children.only(this.props.children)
  }
}

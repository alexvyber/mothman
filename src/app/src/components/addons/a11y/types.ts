export interface ViolationType {
  id: string
  impact: string
  description: string
  help: string
  helpUrl: string
  nodes: { html: string }[]
}

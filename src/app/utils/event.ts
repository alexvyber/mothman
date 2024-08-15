export function stopDefaultPropagation(event: React.SyntheticEvent): void {
  event.preventDefault()
  event.stopPropagation()
}

export function preventDefault(event: React.SyntheticEvent): void {
  event.preventDefault()
}

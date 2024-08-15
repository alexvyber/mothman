function isModifierKeyPressed(event: KeyboardEvent): boolean {
  return event.altKey || event.ctrlKey || event.shiftKey || event.metaKey
}

function shouldIgnoreEvent(event: KeyboardEvent): boolean {
  if (!(event.target instanceof HTMLElement)) {
    return true
  }

  return (
    !event.key ||
    event.target.isContentEditable ||
    (!isModifierKeyPressed(event) && ("INPUT" === event.target.nodeName || "TEXTAREA" === event.target.nodeName))
  )
}

// redirecting keyboard events from the iframe to the parent document
// so the global hotkeys work no matter where the focus is
export function redirectKeydown(event: KeyboardEvent): void {
  if (shouldIgnoreEvent(event)) {
    return
  }

  const newEvent = new KeyboardEvent("keydown", {
    key: event.key,
    code: event.code,
    keyCode: event.keyCode,
    altKey: event.altKey,
    ctrlKey: event.ctrlKey,
    shiftKey: event.shiftKey,
    metaKey: event.metaKey,
  })

  document.dispatchEvent(newEvent)
}

export function redirectKeyup(event: KeyboardEvent): void {
  if (shouldIgnoreEvent(event)) {
    return
  }

  const newEvent = new KeyboardEvent("keyup", {
    key: event.key,
    code: event.code,
    keyCode: event.keyCode,
    altKey: event.altKey,
    ctrlKey: event.ctrlKey,
    shiftKey: event.shiftKey,
    metaKey: event.metaKey,
  })

  document.dispatchEvent(newEvent)
}

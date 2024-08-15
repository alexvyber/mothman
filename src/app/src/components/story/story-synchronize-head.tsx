// detecting parent's document.head changes, so we can apply the same CSS for
// the iframe, for CSS in JS using CSSStyleSheet API we transform it into
// style tags and append them to the iframe's document.head
// also re-fire hotkeys events from iframe to parent

import React, { useEffect } from "react"

import { redirectKeydown, redirectKeyup } from "../../../utils/redirect-events"
import { useFrame } from "../iframe/context"

const CSS_ATTR = "data-debug-css"

function addStyleElement(rule: string, document: Document, index?: number): number {
  const existingTags = document.head.querySelectorAll(`style[${CSS_ATTR}]`)

  const tag = document.createElement("style")

  tag.setAttribute(CSS_ATTR, "true")
  tag.appendChild(document.createTextNode(rule))

  if (index && existingTags[index]) {
    existingTags[index].after(tag)
    return index + 1
  }
  document.head.appendChild(tag)
  return existingTags.length
}

function deleteStyleElement(document: Document, index?: number) {
  const existingTags = document.head.querySelectorAll(`style[${CSS_ATTR}]`)

  if (index !== undefined && existingTags[index]) {
    existingTags[index].remove()
  }
}

interface Props extends React.PropsWithChildren {
  active: boolean
  width: number
}

export function SynchronizeHead({ active, children, width }: Props) {
  const { window: storyWindow, document: iframeDocument } = useFrame()

  const syncHead = () => {
    if (!storyWindow) return

    for (const child of Array.from(document.head.children)) {
      const souldCheck =
        child.tagName === "STYLE" ||
        (child.tagName === "LINK" && child.getAttribute("type") === "text/css") ||
        (child.tagName === "LINK" && child.getAttribute("rel") === "stylesheet")

      if (souldCheck) {
        let exists = false

        for (const element of Array.from(storyWindow.document.head.children)) {
          element.tagName === "LINK" && element.getAttribute("href") === child.getAttribute("href") && (exists = true)

          element.tagName === "STYLE" && element.innerHTML === child.innerHTML && (exists = true)
        }

        if (exists) return

        storyWindow.document.head.appendChild(child.cloneNode(true))
      }
    }
  }

  useEffect(() => {
    const originalInsertRule = window.CSSStyleSheet.prototype.insertRule
    const originalDeleteRule = window.CSSStyleSheet.prototype.deleteRule

    window.CSSStyleSheet.prototype.insertRule = (rule, index) => {
      const retVal = addStyleElement(rule, document, index)

      if (active && iframeDocument) {
        return addStyleElement(rule, iframeDocument, index)
      }

      return retVal
    }

    window.CSSStyleSheet.prototype.deleteRule = (index) => {
      deleteStyleElement(document, index)

      if (active && iframeDocument) {
        deleteStyleElement(iframeDocument, index)
      }
    }

    return () => {
      window.CSSStyleSheet.prototype.insertRule = originalInsertRule
      window.CSSStyleSheet.prototype.deleteRule = originalDeleteRule
    }
  }, [])

  useEffect(() => {
    if (active) return

    syncHead()

    iframeDocument?.addEventListener("keydown", redirectKeydown)
    iframeDocument?.addEventListener("keyup", redirectKeyup)

    const observer = new MutationObserver(() => syncHead())

    document.documentElement.setAttribute("data-iframed", `${width}`)
    observer.observe(document.head, { subtree: true, characterData: true, childList: true })

    return () => {
      observer?.disconnect()
      iframeDocument?.removeEventListener("keydown", redirectKeydown)
      iframeDocument?.removeEventListener("keyup", redirectKeyup)
    }
  }, [active, iframeDocument])

  return children
}

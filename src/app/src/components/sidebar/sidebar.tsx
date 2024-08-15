import { useHotkeys } from "react-hotkeys-hook"

import React, { useEffect, useRef, useState } from "react"

import { preventDefault } from "../../../utils/event"
import { useMothmanContext } from "../../../utils/global-context"
import config from "../../../utils/load-config"
import { getSettings, updateSettings } from "../../../utils/local-storage"
import { TreeView } from "./sidebar-tree-view"
import { debounce } from "./sidebar-utils"

const DEFAULT_WIDTH = 240
const MIN_WIDTH = 192
const MAX_WIDTH = 920

const debouncedUpdateSettings = debounce(updateSettings, 250)

interface Props {
  stories: string[]
}

export function Sidebar({ stories }: Props) {
  const { globalState } = useMothmanContext()

  const [search, setSearch] = useState("")
  const [width, setWidth] = useState(getSettings().sidebarWidth || DEFAULT_WIDTH)
  const [resizeActive, setResizeActive] = useState(false)

  const handleRef = useRef<HTMLDivElement>(null)
  const searchElRef = useRef(null)
  const treeRootRef = useRef<HTMLUListElement | null>(null)

  useEffect(() => {
    // @ts-expect-error
    const parentStyles = window.getComputedStyle(handleRef.current.parentElement)

    const direction = parentStyles.getPropertyValue("flex-direction")

    if (direction === "row-reverse") {
      document.documentElement.setAttribute("data-reversed", "")
    }
  }, [])

  useEffect(() => {
    const mouseMoveHandler = (e: MouseEvent) => {
      if (!resizeActive) {
        return
      }

      setWidth((previousWidth) => {
        const newWidth = document.documentElement.hasAttribute("data-reversed")
          ? previousWidth + e.movementX
          : previousWidth - e.movementX

        if (newWidth < MIN_WIDTH) {
          debouncedUpdateSettings({ sidebarWidth: MIN_WIDTH })
          return MIN_WIDTH
        }

        if (newWidth > MAX_WIDTH) {
          debouncedUpdateSettings({ sidebarWidth: MAX_WIDTH })
          return MAX_WIDTH
        }

        debouncedUpdateSettings({ sidebarWidth: newWidth })

        return newWidth
      })
    }

    const mouseUpHandler = () => {
      if (resizeActive) {
        document.body.style.cursor = "auto"
        setResizeActive(false)
      }
    }

    window.addEventListener("mousemove", mouseMoveHandler)
    window.addEventListener("mouseup", mouseUpHandler)

    return () => {
      window.removeEventListener("mousemove", mouseMoveHandler)
      window.removeEventListener("mouseup", mouseUpHandler)
    }
  }, [resizeActive, setResizeActive, setWidth, handleRef.current])

  useHotkeys(config.hotkeys.search, () => (searchElRef.current as any as HTMLInputElement).focus(), {
    preventDefault: true,
    enabled: globalState.hotkeys,
  })

  const canonicalSearch = search.toLocaleLowerCase().replace(/\s+/g, "-")

  const filteredStories = stories.filter((story) => story.includes(canonicalSearch))

  const onGrab: React.MouseEventHandler<HTMLDivElement> = (event) => {
    event.preventDefault()

    if (!resizeActive) {
      document.body.style.cursor = "col-resize"
      setResizeActive(true)
    }
  }

  const focus: React.KeyboardEventHandler<HTMLInputElement> = (e) => {
    e.key === "ArrowDown" && (treeRootRef?.current?.firstChild as HTMLLIElement | undefined)?.focus?.()
  }

  const onSearchChange: React.ChangeEventHandler<HTMLInputElement> = (e) => setSearch(e.target.value)

  const treeRootRefChange = (node: HTMLUListElement | null) => (treeRootRef.current = node)

  return (
    <>
      <div
        role="separator"
        aria-orientation="vertical"
        ref={handleRef}
        className={`moth-resize-handle ${resizeActive ? "moth-resize-active" : ""}`}
        onDragStart={preventDefault}
        onDragEnd={preventDefault}
        onDrop={preventDefault}
        onDragOver={preventDefault}
        onDragEnter={preventDefault}
        onDragLeave={preventDefault}
        onMouseDown={onGrab}
      />

      <nav
        role="navigation"
        className="moth-aside"
        style={{ minWidth: `${width}px` }}
      >
        <input
          placeholder="Search"
          aria-label="Search stories"
          value={search}
          ref={searchElRef}
          onKeyDown={focus}
          onChange={onSearchChange}
        />

        <TreeView
          searchRef={searchElRef}
          stories={filteredStories}
          story={globalState.story}
          hotkeys={globalState.hotkeys}
          searchActive={search !== ""}
          setTreeRootRef={treeRootRefChange}
        />
      </nav>
    </>
  )
}

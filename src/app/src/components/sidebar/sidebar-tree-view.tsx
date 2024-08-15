import { useHotkeys } from "react-hotkeys-hook"

import React, { useEffect, useRef, useState } from "react"

import { stopDefaultPropagation } from "../../../utils/event"
import { useMothmanContext } from "../../../utils/global-context"
import { modifyParams, resetParams } from "../../../utils/history"
import config from "../../../utils/load-config"
import { getStoryTree } from "../../../utils/story-name"
import { Action, StoryTreeItem } from "../../types"
import { NavSection } from "./sidebar-nav-section"
import {
  getEndId,
  getFirstChildId,
  getFirstLink,
  getNextId,
  getParentId,
  getPrevId,
  getSubtree,
  toggleIsExpanded,
} from "./sidebar-utils"

interface TreeItemRefs {
  current: Record<string, HTMLElement | null>
}

interface Props {
  stories: string[]
  story: string
  searchRef: React.Ref<HTMLLinkElement>
  setTreeRootRef: (node: HTMLUListElement | null) => void
  searchActive?: boolean
  hotkeys: boolean
}

export const TreeView = ({ stories, story, searchActive, searchRef, setTreeRootRef, hotkeys }: Props) => {
  const { globalState, dispatch } = useMothmanContext()

  const treeItemRefs: TreeItemRefs = useRef({})

  const [tree, setTree] = useState(getStoryTree(stories, story, searchActive))

  useEffect(() => {
    setTree(getStoryTree(stories, story, searchActive))
  }, [stories.join(",")])

  const [selectedItemId, setSelectedItemId] = useState<string | null>(tree.length && tree[0]?.id ? tree[0].id : null)

  const focusSelectedItem = (id: string | null) => {
    if (id && treeItemRefs && treeItemRefs.current[id]) {
      treeItemRefs.current[id]?.focus()
    }

    tree[0]?.id && setSelectedItemId(id ? id : tree[0]?.id)

    !id && (searchRef as any).current.focus()
  }

  const hotkeyStoryTransition = (story?: string) => {
    if (story) {
      updateStory(story)
      setTree(getStoryTree(stories, story, searchActive))
      setTimeout(() => focusSelectedItem(story), 1)
    }
  }

  useHotkeys(
    config.hotkeys.nextStory,
    () => {
      const currentIndex = stories.findIndex((s) => s === story)
      hotkeyStoryTransition(stories[currentIndex + 1])
    },
    { preventDefault: true, enableOnFormTags: true, enabled: hotkeys }
  )

  useHotkeys(
    config.hotkeys.previousStory,

    () => {
      const currentIndex = stories.findIndex((s) => s === story)
      hotkeyStoryTransition(stories[currentIndex - 1])
    },

    { preventDefault: true, enableOnFormTags: true, enabled: hotkeys }
  )

  useHotkeys(
    config.hotkeys.nextComponent,
    () => {
      const currentIndex = stories.findIndex((s) => s === story)
      const storyParts = stories[currentIndex]?.split("--")
      const componentPart = storyParts?.[storyParts.length - 2]

      for (let i = currentIndex + 1; i < stories.length; i++) {
        const parts = stories[i]?.split("--")

        if (parts?.[parts.length - 2] !== componentPart) {
          hotkeyStoryTransition(stories[i])
          return
        }
      }
    },
    { preventDefault: true, enableOnFormTags: true, enabled: hotkeys }
  )

  useHotkeys(
    config.hotkeys.previousComponent,
    () => {
      const currentIndex = stories.findIndex((s) => s === story)
      const storyParts = stories[currentIndex]?.split("--")
      const componentPart = storyParts?.[storyParts?.length - 2]

      for (let i = currentIndex - 1; i >= 0; i--) {
        const parts = stories[i]?.split("--")
        const prevParts = i > 0 ? stories[i - 1]?.split("--") : ["", ""]

        if (
          parts?.[parts?.length - 2] !== componentPart &&
          prevParts?.[prevParts.length - 2] !== parts?.[parts.length - 2]
        ) {
          hotkeyStoryTransition(stories[i])
          return
        }
      }
    },
    { preventDefault: true, enableOnFormTags: true, enabled: hotkeys }
  )

  const onKeyDownFn = (event: React.KeyboardEvent<HTMLElement>, item: StoryTreeItem) => {
    if (event.metaKey || event.ctrlKey || event.altKey) {
      return
    }

    switch (event.key) {
      case "ArrowRight": {
        stopDefaultPropagation(event)
        if (item.isExpanded) {
          focusSelectedItem(getFirstChildId(tree, item.id))
        } else {
          setTree(toggleIsExpanded(tree, item))
        }
        break
      }

      case "ArrowLeft": {
        stopDefaultPropagation(event)
        if (item.isExpanded) {
          setTree(toggleIsExpanded(tree, item))
        } else {
          focusSelectedItem(getParentId(tree, item.id, null))
        }
        break
      }

      case "ArrowUp": {
        stopDefaultPropagation(event)
        focusSelectedItem(getPrevId(tree, item.id, null))
        break
      }

      case "ArrowDown": {
        stopDefaultPropagation(event)
        const nextId = getNextId(tree, item.id, null)
        nextId && focusSelectedItem(nextId)
        break
      }

      case " ":
      case "Enter": {
        if (event.target instanceof HTMLAnchorElement && !event.target.href) {
          stopDefaultPropagation(event)
          setTree(toggleIsExpanded(tree, item))
        }
        break
      }

      case "Home": {
        stopDefaultPropagation(event)
        if (tree.length) {
          tree[0]?.id && focusSelectedItem(tree[0].id)
        }
        break
      }

      case "End": {
        stopDefaultPropagation(event)
        focusSelectedItem(getEndId(tree))
        break
      }
    }
  }

  const onItemClick = (item: StoryTreeItem) => {
    const newTree = toggleIsExpanded(tree, item)
    const firstChildLink = getFirstLink(getSubtree(newTree, item.id), item.id)
    firstChildLink && story !== firstChildLink.id && firstChildLink.isExpanded && updateStory(firstChildLink.id)
    setTree(newTree)
  }

  const updateStory = (storyId: string) => {
    resetParams()
    // we need to strip the control state from the URL first
    // so it doesn't leak into other stories with the same named controls
    modifyParams({ ...globalState, story: storyId, control: {} })
    dispatch({ type: Action.UpdateStory, payload: storyId })
  }

  return (
    <ul
      role="tree"
      style={{ marginInlineStart: "-6px" }}
      ref={setTreeRootRef}
    >
      <NavSection
        tree={tree}
        fullTree={tree}
        story={story}
        updateStory={updateStory}
        onItemClick={onItemClick}
        selectedItemId={selectedItemId}
        onKeyDownFn={onKeyDownFn}
        treeItemRefs={treeItemRefs}
      />
    </ul>
  )
}

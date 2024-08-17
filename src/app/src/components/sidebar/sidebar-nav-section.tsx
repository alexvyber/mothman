import React from "react"

import { preventDefault } from "../../../utils/event"
import { getHref } from "../../../utils/history"
import { StoryTree, StoryTreeItem, UpdateStory } from "../../types"
import { Down, Page } from "../icons"

interface TreeItemRefs {
  current: Record<string, HTMLElement | null>
}

interface Props {
  tree: StoryTree
  fullTree: StoryTree
  story: string
  updateStory: UpdateStory
  onKeyDownFn: (e: React.KeyboardEvent<HTMLElement>, item: StoryTreeItem) => void
  selectedItemId: string | null
  onItemClick: (item: StoryTreeItem) => void
  treeItemRefs: TreeItemRefs
}

export function NavSection({
  tree,
  fullTree,
  story,
  updateStory,
  onItemClick,
  onKeyDownFn,
  selectedItemId,
  treeItemRefs,
}: Props) {
  return tree.map((treeProps) => (
    <li
      role="treeitem"
      onDragStart={preventDefault}
      onKeyDown={(event) => onKeyDownFn(event, treeProps)}
      aria-expanded={treeProps.isExpanded}
      title={treeProps.name}
      tabIndex={treeProps.id === selectedItemId && !treeProps.isLinkable ? 0 : -1}
      ref={treeProps.isLinkable ? undefined : (element) => (treeItemRefs.current[treeProps.id] = element)}
      key={treeProps.id}
      className={`${treeProps.isLinkable ? "moth-linkable mt-2" : ""} ${treeProps.id === story ? "moth-active" : ""}`}
    >
      {treeProps.isLinkable && (
        <div className="flex">
          <Page />

          <a
            tabIndex={treeProps.id === selectedItemId ? 0 : -1}
            ref={(element) => (treeItemRefs.current[treeProps.id] = element)}
            href={getHref({ story: treeProps.id })}
            onKeyDown={(event) => story !== treeProps.id && onKeyDownFn(event, treeProps)}
            onClick={(event) => {
              if (!(event.ctrlKey || event.metaKey)) {
                event.preventDefault()
                story !== treeProps.id && updateStory(treeProps.id)
              }
            }}
          >
            {treeProps.name}
          </a>
        </div>
      )}

      {!treeProps.isLinkable && (
        <div
          title={treeProps.name}
          onClick={() => onItemClick(treeProps)}
          className="flex cursor-pointer"
        >
          <Down rotate={!treeProps.isExpanded} />

          <div className="text overflow-hidden text-ellipsis whitespace-nowrap">{treeProps.name}</div>
        </div>
      )}

      {Object.keys(treeProps.children).length > 0 && treeProps.isExpanded && (
        <ul role="group">
          <NavSection
            tree={treeProps.children}
            fullTree={fullTree}
            story={story}
            updateStory={updateStory}
            selectedItemId={selectedItemId}
            onKeyDownFn={onKeyDownFn}
            onItemClick={onItemClick}
            treeItemRefs={treeItemRefs}
          />
        </ul>
      )}
    </li>
  ))
}

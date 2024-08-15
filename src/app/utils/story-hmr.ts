export const watchers: (() => void)[] = []

export function storyUpdated() {
  for (const watcher of watchers) {
    watcher()
  }
}

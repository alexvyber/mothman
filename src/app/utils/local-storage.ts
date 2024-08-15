interface Settings {
  appId?: string
  sidebarWidth?: number
}

const APP_ID = import.meta.env.VITE_MTH_APP_ID
const storageKey = `moth-settings-${APP_ID}`
const defaultValue = { appId: APP_ID }

export function updateSettings(settings: Settings): void {
  const storageValue = localStorage.getItem(storageKey)

  let storageSettings = defaultValue

  try {
    if (storageValue) {
      storageSettings = JSON.parse(storageValue)
    }
  } catch (error) {
    // do nothing
  }

  localStorage.setItem(storageKey, JSON.stringify({ ...storageSettings, ...settings }))
}

export function getSettings(): Settings {
  const storageValue = localStorage.getItem(storageKey)

  let storageSettings = defaultValue

  try {
    if (storageValue) {
      storageSettings = JSON.parse(storageValue)
    }
  } catch (error) {
    // do nothing
  }

  return storageSettings as Settings
}

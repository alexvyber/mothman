// adapted from https://github.com/vitejs/vite/blob/main/packages/vite/src/node/utils.ts

import { UserConfig } from "../app/src/types"

export function mergeViteConfigs(defaults: UserConfig, overrides: UserConfig, isRoot = true) {
  return mergeConfigRecursively(defaults, overrides, isRoot ? "" : ".")
}

function arraify<T>(target: T | [T]): [T] {
  return Array.isArray(target) ? target : [target]
}

function isObject(value: unknown): value is object {
  return Object.prototype.toString.call(value) === "[object Object]"
}

function mergeConfigRecursively(defaults: UserConfig, overrides: UserConfig, rootPath: string) {
  const merged: UserConfig = { ...defaults }

  for (const key in overrides) {
    // @ts-expect-error
    const value = overrides[key]
    if (value == null) {
      continue
    }

    // @ts-expect-error
    const existing = merged[key]
    if (existing == null) {
      // @ts-expect-error
      merged[key] = value
      continue
    }

    if (Array.isArray(existing) || Array.isArray(value)) {
      // @ts-expect-error
      merged[key] = arraify(existing ?? []).concat(arraify(value ?? []))
      continue
    }

    if (isObject(existing) && isObject(value)) {
      // @ts-expect-error
      merged[key] = mergeConfigRecursively(existing, value, rootPath ? `${rootPath}.${key}` : key)
      continue
    }

    // @ts-expect-error
    merged[key] = value
  }

  return merged
}

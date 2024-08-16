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
    const value = overrides[key as keyof typeof overrides]

    if (value == null) {
      continue
    }

    const existing = merged[key as keyof typeof merged]

    if (existing == null) {
      Object.assign(merged, { [key]: value })
      continue
    }

    if (Array.isArray(existing) || Array.isArray(value)) {
      Object.assign(merged, { [key]: arraify(existing ?? []).concat(arraify(value ?? [])) })
      continue
    }

    if (isObject(existing) && isObject(value)) {
      Object.assign(merged, {
        [key]: mergeConfigRecursively(
          // @ts-expect-error
          existing,
          value,
          rootPath ? `${rootPath}.${key}` : key
        ),
      })
      continue
    }

    Object.assign(merged, { [key]: value })
  }

  return merged
}

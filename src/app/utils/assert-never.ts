export function assertNever(arg: never): never {
  throw new Error(`arg must be of type never. Got arg: ${typeof arg}`)
}

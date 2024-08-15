export function coerceString(value: string, options?: any[]): number | string | boolean {
  const shouldCoerceToNumber = options?.some((option) => option === Number(value))

  if (shouldCoerceToNumber) {
    return Number(value)
  }

  const isBoolean = value === "true" || value === "false"

  if (!isBoolean) {
    return value
  }

  return value !== "false"
}

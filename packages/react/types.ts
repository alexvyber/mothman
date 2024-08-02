export type ProduceOptions<T extends { [key: string]: { type: "string" | "boolean" } }> = {
  [Key in keyof T]: T[Key]["type"] extends "string" ? string : T[Key]["type"] extends "boolean" ? boolean : never
}

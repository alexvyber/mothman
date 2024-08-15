/** @type {import('prettier').Config} */
export default {
  printWidth: 120,
  semi: false,
  singleQuote: false,
  arrowParens: "always",
  proseWrap: "always", // printWidth line breaks in md/mdx
  tabWidth: 2,
  trailingComma: "es5",

  // importOrderSeparation: false, // import order groups won't be separated by a new line
  // importOrderSortSpecifiers: true, // sorts the import specifiers alphabetically
  // importOrderCaseInsensitive: true, // case-insensitive sorting
  // importOrderParserPlugins: ["typescript", "jsx", "decorators-legacy"],
  // importOrderMergeDuplicateImports: true,
  // importOrderCombineTypeAndValueImports: true,

  tailwindFunctions: ["cvax", "cx", "cn"],

  plugins: ["@ianvs/prettier-plugin-sort-imports", "prettier-plugin-pkg", "prettier-plugin-tailwindcss"],

  importOrder: [
    "<THIRD_PARTY_MODULES>",
    "",
    "^(react/(.*)$)|^(react$)",
    "^(next/(.*)$)|^(next$)",
    "",
    "^types$",
    "",
    "^(@|\\d|_)",
    "^@/types/(.*)$",
    "^@/config/(.*)$",
    "^@/lib/(.*)$",
    "^@/components/(.*)$",
    "^@/styles/(.*)$",
    "^[./]",
    "",
    "^@/graphql/(.*)$",
    "",
    "^@/assets/(.*)$",
  ],
}

export function Button({ children, className, ...props }: React.ComponentProps<"button">) {
  return (
    <button
      {...props}
      className={`${className} mx-2 my-[1px] w-auto cursor-pointer overflow-visible rounded border border-indigo-800 p-2 shadow-sm hover:bg-indigo-600`}
      type="button"
    >
      {children}
    </button>
  )
}

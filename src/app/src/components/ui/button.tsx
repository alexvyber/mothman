export function Button({ children, className, ...props }: React.ComponentProps<"button">) {
  return (
    <button
      {...props}
      className={`${className} moth-button`}
      type="button"
    >
      {children}
    </button>
  )
}

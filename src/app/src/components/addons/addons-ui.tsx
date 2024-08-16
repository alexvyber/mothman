export function AddonTooltip({ text }: { text: string }) {
  return (
    <span className="moth-addon-tooltip absolute start-1 z-50 -mt-[96px] hidden whitespace-nowrap rounded bg-slate-100 p-2.5 text-indigo-500 shadow-sm">
      {text}
    </span>
  )
}

export function AddonBadge({ children }: React.PropsWithChildren) {
  return (
    <div className="moth-badge flex h-5 min-w-5 items-center justify-center rounded-full bg-indigo-500 p-1.5 text-xs font-normal text-white">
      {children}
    </div>
  )
}

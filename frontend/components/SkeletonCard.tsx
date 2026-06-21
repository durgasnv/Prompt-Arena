export default function SkeletonCard() {
  return (
    <div className="flex flex-col gap-3 rounded-2xl border border-zinc-700 bg-zinc-800 p-5 animate-pulse">
      <div className="flex items-center justify-between">
        <div className="h-3.5 w-28 rounded bg-zinc-700" />
        <div className="h-3 w-12 rounded bg-zinc-700" />
      </div>
      <div className="flex flex-col gap-2 flex-1">
        <div className="h-3 w-full rounded bg-zinc-700" />
        <div className="h-3 w-5/6 rounded bg-zinc-700" />
        <div className="h-3 w-4/6 rounded bg-zinc-700" />
      </div>
      <div className="flex gap-4 border-t border-zinc-700 pt-3 mt-auto">
        <div className="h-7 w-10 rounded bg-zinc-700" />
        <div className="h-7 w-10 rounded bg-zinc-700" />
        <div className="h-7 w-16 rounded bg-zinc-700" />
      </div>
    </div>
  )
}

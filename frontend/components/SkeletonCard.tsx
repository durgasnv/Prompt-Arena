export default function SkeletonCard() {
  return (
    <div
      className="flex flex-col gap-4 rounded-2xl border p-6 min-h-72 animate-pulse"
      style={{ background: '#141417', borderColor: 'rgba(39,39,42,0.7)' }}
    >
      <div className="flex items-center justify-between mt-1">
        <div className="flex items-center gap-2.5">
          <div className="w-2 h-2 rounded-full bg-zinc-800" />
          <div className="h-4 w-32 rounded-full bg-zinc-800" />
        </div>
        <div className="h-3.5 w-14 rounded-full bg-zinc-800" />
      </div>
      <div className="flex flex-col gap-2.5 flex-1 mt-1">
        <div className="h-3 w-full rounded bg-zinc-800" />
        <div className="h-3 w-5/6 rounded bg-zinc-800" />
        <div className="h-3 w-4/6 rounded bg-zinc-800" />
        <div className="h-3 w-3/4 rounded bg-zinc-800" />
        <div className="h-3 w-2/3 rounded bg-zinc-800" />
      </div>
      <div className="flex gap-6 border-t pt-4 mt-auto" style={{ borderColor: 'rgba(39,39,42,0.8)' }}>
        <div className="flex flex-col gap-1.5">
          <div className="h-2 w-10 rounded bg-zinc-800" />
          <div className="h-3.5 w-8 rounded bg-zinc-800" />
        </div>
        <div className="flex flex-col gap-1.5">
          <div className="h-2 w-12 rounded bg-zinc-800" />
          <div className="h-3.5 w-8 rounded bg-zinc-800" />
        </div>
        <div className="flex flex-col gap-1.5">
          <div className="h-2 w-8 rounded bg-zinc-800" />
          <div className="h-3.5 w-14 rounded bg-zinc-800" />
        </div>
      </div>
    </div>
  )
}

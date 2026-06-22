'use client'

export default function Header() {
  return (
    <header
      className="sticky top-0 z-50 border-b"
      style={{
        background: 'rgba(9,9,11,0.88)',
        backdropFilter: 'blur(16px)',
        WebkitBackdropFilter: 'blur(16px)',
        borderColor: 'rgba(39,39,42,0.7)',
      }}
    >
      <div className="mx-auto max-w-5xl flex items-center gap-3 px-4 py-3">

        {/* Glyph: one source dot diverging to three */}
        <svg width="26" height="26" viewBox="0 0 26 26" fill="none" aria-hidden="true">
          <circle cx="5" cy="13" r="2.5" fill="#6366f1" />
          <line x1="7.4" y1="12.2" x2="15.5" y2="6.5" stroke="#6366f1" strokeWidth="1.4" strokeLinecap="round" opacity="0.65" />
          <line x1="7.4" y1="13" x2="15.5" y2="13" stroke="#6366f1" strokeWidth="1.4" strokeLinecap="round" opacity="0.65" />
          <line x1="7.4" y1="13.8" x2="15.5" y2="19.5" stroke="#6366f1" strokeWidth="1.4" strokeLinecap="round" opacity="0.65" />
          <circle cx="18" cy="6.5" r="2" fill="#8b5cf6" />
          <circle cx="18" cy="13" r="2" fill="#8b5cf6" />
          <circle cx="18" cy="19.5" r="2" fill="#8b5cf6" />
        </svg>

        {/* Wordmark */}
        <span
          className="text-[15px] font-bold text-zinc-100 tracking-tight"
          style={{ fontFamily: 'var(--font-space-grotesk)' }}
        >
          Prompt Arena
        </span>

        {/* Version pill */}
        <span
          className="rounded-full border px-2 py-0.5 text-[10px] font-medium tracking-wide"
          style={{
            borderColor: 'rgba(63,63,70,0.8)',
            background: 'rgba(24,24,27,0.8)',
            color: '#52525b',
            fontFamily: 'var(--font-jetbrains-mono)',
          }}
        >
          v1.0
        </span>

        <div className="hidden sm:block h-4 w-px mx-1" style={{ background: 'rgba(39,39,42,0.8)' }} />

        <p
          className="hidden sm:block text-xs"
          style={{ color: '#52525b', fontFamily: 'var(--font-manrope)' }}
        >
          Run once. Compare everything.
        </p>

        {/* ⌘↵ hint */}
        <div className="ml-auto">
          <span
            className="flex items-center gap-1 rounded-lg border px-2.5 py-1 text-[11px]"
            style={{
              borderColor: 'rgba(39,39,42,0.8)',
              background: 'rgba(20,20,23,0.8)',
              color: '#3f3f46',
              fontFamily: 'var(--font-jetbrains-mono)',
            }}
          >
            <kbd>⌘</kbd><kbd>↵</kbd>
            <span className="ml-1 text-[10px]">to run</span>
          </span>
        </div>
      </div>
    </header>
  )
}

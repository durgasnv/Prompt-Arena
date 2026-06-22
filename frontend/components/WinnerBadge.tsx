export default function WinnerBadge() {
  return (
    <span
      className="absolute -top-3.5 left-5 flex items-center gap-1.5 rounded-full px-3 py-1 text-[10px] font-bold uppercase tracking-widest"
      style={{
        background: 'linear-gradient(135deg, #fbbf24 0%, #f59e0b 100%)',
        color: '#78350f',
        boxShadow: '0 0 16px rgba(251,191,36,0.55), 0 2px 8px rgba(251,191,36,0.3)',
        fontFamily: 'var(--font-jetbrains-mono)',
      }}
    >
      ★ Winner
    </span>
  )
}

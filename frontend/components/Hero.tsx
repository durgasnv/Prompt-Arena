'use client'

import dynamic from 'next/dynamic'

const Strands = dynamic(() => import('./Strands'), { ssr: false })

export type Motion = 'full' | 'subtle' | 'off'

interface Props {
  motion: Motion
}

export default function Hero({ motion }: Props) {
  return (
    <div className="relative w-full overflow-hidden" style={{ height: 330 }}>

      {/* Layer 1: CSS radial blobs */}
      {motion !== 'off' && (
        <div className="absolute inset-0 overflow-hidden">
          <div
            className="absolute rounded-full"
            style={{
              width: 640, height: 420,
              left: '5%', top: '-25%',
              background: 'radial-gradient(ellipse, rgba(99,102,241,0.22) 0%, transparent 68%)',
              animation: motion === 'full' ? 'blob-float-1 9s ease-in-out infinite' : undefined,
              opacity: motion === 'subtle' ? 0.45 : 1,
            }}
          />
          <div
            className="absolute rounded-full"
            style={{
              width: 520, height: 360,
              right: '2%', top: '5%',
              background: 'radial-gradient(ellipse, rgba(139,92,246,0.18) 0%, transparent 68%)',
              animation: motion === 'full' ? 'blob-float-2 11s ease-in-out infinite' : undefined,
              opacity: motion === 'subtle' ? 0.45 : 1,
            }}
          />
          <div
            className="absolute rounded-full"
            style={{
              width: 440, height: 300,
              left: '38%', bottom: '-15%',
              background: 'radial-gradient(ellipse, rgba(6,182,212,0.12) 0%, transparent 68%)',
              animation: motion === 'full' ? 'blob-float-3 13s ease-in-out infinite' : undefined,
              opacity: motion === 'subtle' ? 0.45 : 1,
            }}
          />
        </div>
      )}

      {/* Layer 1 (off): static gradient */}
      {motion === 'off' && (
        <div
          className="absolute inset-0"
          style={{
            background:
              'radial-gradient(ellipse at 25% 50%, rgba(99,102,241,0.14) 0%, transparent 55%), ' +
              'radial-gradient(ellipse at 75% 50%, rgba(139,92,246,0.11) 0%, transparent 55%)',
          }}
        />
      )}

      {/* Layer 2: Strands canvas */}
      {motion !== 'off' && (
        <div
          className="absolute inset-0"
          style={{ opacity: motion === 'subtle' ? 0.3 : 0.55 }}
        >
          <Strands
            colors={['#6366f1', '#8b5cf6', '#06b6d4']}
            count={motion === 'full' ? 4 : 2}
            speed={motion === 'full' ? 0.4 : 0.15}
            amplitude={0.6}
            opacity={1}
            glow={motion === 'full' ? 2 : 1}
            style={{}}
          />
        </div>
      )}

      {/* Layer 3: Radial mesh vignette */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          background:
            'radial-gradient(ellipse at 50% 50%, transparent 35%, rgba(9,9,11,0.65) 100%)',
        }}
      />

      {/* Title */}
      <div className="absolute inset-0 flex flex-col items-center justify-center gap-3 pointer-events-none select-none">
        <h1
          className="flex items-baseline gap-3"
          style={{
            fontFamily: 'var(--font-space-grotesk)',
            fontSize: 'clamp(2.5rem, 6vw, 3.5rem)',
            fontWeight: 700,
            letterSpacing: '-0.02em',
            lineHeight: 1,
          }}
        >
          <span
            className="text-zinc-100 word-blur-in"
            style={{ animationDelay: '0ms', opacity: 0 }}
          >
            Prompt
          </span>
          <span
            className="word-blur-in"
            style={{
              animationDelay: '130ms',
              opacity: 0,
              background: 'linear-gradient(135deg, #818cf8 0%, #a78bfa 45%, #67e8f9 100%)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              backgroundClip: 'text',
            }}
          >
            Arena
          </span>
        </h1>

        <p
          className="text-sm word-blur-in"
          style={{
            animationDelay: '260ms',
            opacity: 0,
            color: '#71717a',
            fontFamily: 'var(--font-manrope)',
            letterSpacing: '0.02em',
          }}
        >
          Run once. Compare everything.
        </p>
      </div>
    </div>
  )
}

'use client'

import { useState } from 'react'
import type { ModelResult } from '@/app/page'
import ModelCard from './ModelCard'
import SkeletonCard from './SkeletonCard'

interface Props {
  results: ModelResult[]
  isLoading?: boolean
  modelCount?: number
}

function findWinner(results: ModelResult[]): string | null {
  const ok = results.filter(r => r.error === null && r.latency_ms != null)
  if (ok.length === 0) return null
  return ok.reduce((a, b) => a.latency_ms! < b.latency_ms! ? a : b).model
}

export default function ResultsGrid({ results, isLoading, modelCount = 5 }: Props) {
  const [index, setIndex] = useState(0)
  const winner = findWinner(results)

  const pendingCount = isLoading ? Math.max(0, modelCount - results.length) : 0
  const total = results.length + pendingCount
  const safe = Math.min(index, Math.max(0, total - 1))

  const prev = () => setIndex(i => Math.max(0, i - 1))
  const next = () => setIndex(i => Math.min(total - 1, i + 1))
  const currentIsResult = safe < results.length

  return (
    <div className="flex flex-col gap-5">

      {isLoading && (
        <p
          className="text-[11px] text-center"
          style={{ color: '#3f3f46', fontFamily: 'var(--font-jetbrains-mono)' }}
        >
          {results.length} / {modelCount} models done…
        </p>
      )}

      {/* Carousel */}
      <div className="relative flex items-center gap-3">
        <NavBtn onClick={prev} disabled={safe === 0} label="Previous">‹</NavBtn>

        <div className="flex-1 min-w-0">
          {currentIsResult
            ? <ModelCard result={results[safe]} isWinner={results[safe]?.model === winner} />
            : <SkeletonCard />
          }
        </div>

        <NavBtn onClick={next} disabled={safe >= total - 1} label="Next">›</NavBtn>
      </div>

      {/* Dots */}
      <div className="flex justify-center gap-2 items-center">
        {Array.from({ length: total }).map((_, i) => {
          const arrived = i < results.length
          const active = i === safe
          return (
            <button
              key={i}
              onClick={() => setIndex(i)}
              aria-label={`Card ${i + 1}`}
              className="rounded-full transition-all duration-200"
              style={{
                width: active ? 16 : 8,
                height: 8,
                background: active ? '#6366f1' : arrived ? '#3f3f46' : '#1c1c1f',
                boxShadow: active ? '0 0 10px rgba(99,102,241,0.6)' : 'none',
                opacity: !arrived && !active ? 0.5 : 1,
              }}
            />
          )
        })}
      </div>
    </div>
  )
}

function NavBtn({
  onClick, disabled, label, children,
}: {
  onClick: () => void; disabled: boolean; label: string; children: React.ReactNode
}) {
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      aria-label={label}
      className="flex-shrink-0 flex items-center justify-center w-9 h-9 rounded-full border text-lg transition-all duration-150"
      style={{
        background: '#141417',
        borderColor: disabled ? 'rgba(39,39,42,0.4)' : 'rgba(63,63,70,0.7)',
        color: disabled ? '#27272a' : '#71717a',
        cursor: disabled ? 'not-allowed' : 'pointer',
      }}
    >
      {children}
    </button>
  )
}

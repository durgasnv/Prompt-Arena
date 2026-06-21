'use client'

import { useState } from 'react'
import type { ModelResult } from '@/app/page'
import ModelCard from './ModelCard'
import SkeletonCard from './SkeletonCard'
import LatencyChart from './LatencyChart'
import CostChart from './CostChart'

interface Props {
  results: ModelResult[]
  isLoading?: boolean
  pendingModels?: string[]
}

function findWinner(results: ModelResult[]): string | null {
  const successful = results.filter(r => r.error === null && r.latency_ms != null)
  if (successful.length === 0) return null
  return successful.reduce((fastest, r) =>
    r.latency_ms! < fastest.latency_ms! ? r : fastest
  ).model
}

export default function ResultsGrid({ results, isLoading, pendingModels = [] }: Props) {
  const [index, setIndex] = useState(0)
  const winner = findWinner(results)

  // Items: completed results first, then a skeleton per pending model
  const total = results.length + (isLoading ? pendingModels.length : 0)
  const safeIndex = Math.min(index, Math.max(0, total - 1))

  const prev = () => setIndex(i => Math.max(0, i - 1))
  const next = () => setIndex(i => Math.min(total - 1, i + 1))

  const currentIsResult = safeIndex < results.length

  return (
    <div className="flex flex-col gap-6">

      {/* Carousel */}
      <div className="relative flex items-center gap-3">
        <button
          onClick={prev}
          disabled={safeIndex === 0}
          className="flex-shrink-0 flex items-center justify-center w-9 h-9 rounded-full border border-zinc-700 bg-zinc-800 text-zinc-300 text-lg hover:text-white hover:border-indigo-500 disabled:opacity-25 disabled:cursor-not-allowed transition-colors"
          aria-label="Previous"
        >‹</button>

        <div className="flex-1 min-w-0">
          {currentIsResult ? (
            <ModelCard
              result={results[safeIndex]}
              isWinner={results[safeIndex]?.model === winner}
            />
          ) : (
            <SkeletonCard />
          )}
        </div>

        <button
          onClick={next}
          disabled={safeIndex >= total - 1}
          className="flex-shrink-0 flex items-center justify-center w-9 h-9 rounded-full border border-zinc-700 bg-zinc-800 text-zinc-300 text-lg hover:text-white hover:border-indigo-500 disabled:opacity-25 disabled:cursor-not-allowed transition-colors"
          aria-label="Next"
        >›</button>
      </div>

      {/* Dots */}
      <div className="flex justify-center gap-2">
        {Array.from({ length: total }).map((_, i) => (
          <button
            key={i}
            onClick={() => setIndex(i)}
            className={`rounded-full transition-all ${
              i === safeIndex
                ? 'w-4 h-2 bg-indigo-400'
                : i < results.length
                ? 'w-2 h-2 bg-zinc-500 hover:bg-zinc-300'
                : 'w-2 h-2 bg-zinc-700 animate-pulse'
            }`}
            aria-label={`Card ${i + 1}`}
          />
        ))}
      </div>

      {/* Progress label while streaming */}
      {isLoading && (
        <p className="text-center text-xs text-zinc-500">
          {results.length} of {results.length + pendingModels.length} models responded…
        </p>
      )}

      {/* Charts once we have at least 2 results */}
      {results.length >= 2 && (
        <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
          <LatencyChart results={results} />
          <CostChart results={results} />
        </div>
      )}
    </div>
  )
}

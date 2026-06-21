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
  modelCount?: number
}

function findWinner(results: ModelResult[]): string | null {
  const successful = results.filter(r => r.error === null && r.latency_ms != null)
  if (successful.length === 0) return null
  return successful.reduce((fastest, r) =>
    r.latency_ms! < fastest.latency_ms! ? r : fastest
  ).model
}

export default function ResultsGrid({ results, isLoading, modelCount = 5 }: Props) {
  const [index, setIndex] = useState(0)
  const winner = findWinner(results)
  const total = isLoading ? modelCount : results.length
  const safeIndex = Math.min(index, total - 1)

  const prev = () => setIndex(i => Math.max(0, i - 1))
  const next = () => setIndex(i => Math.min(total - 1, i + 1))

  return (
    <div className="flex flex-col gap-8">

      {/* Carousel */}
      <div className="relative flex items-center gap-3">

        {/* Left arrow */}
        <button
          onClick={prev}
          disabled={safeIndex === 0}
          className="flex-shrink-0 flex items-center justify-center w-9 h-9 rounded-full border border-zinc-700 bg-zinc-800 text-zinc-400 hover:text-zinc-100 hover:border-indigo-500 disabled:opacity-25 disabled:cursor-not-allowed transition-colors"
          aria-label="Previous"
        >
          ‹
        </button>

        {/* Card slot */}
        <div className="flex-1 min-w-0">
          {isLoading ? (
            <SkeletonCard />
          ) : (
            <ModelCard
              result={results[safeIndex]}
              isWinner={results[safeIndex]?.model === winner}
            />
          )}
        </div>

        {/* Right arrow */}
        <button
          onClick={next}
          disabled={safeIndex === total - 1}
          className="flex-shrink-0 flex items-center justify-center w-9 h-9 rounded-full border border-zinc-700 bg-zinc-800 text-zinc-400 hover:text-zinc-100 hover:border-indigo-500 disabled:opacity-25 disabled:cursor-not-allowed transition-colors"
          aria-label="Next"
        >
          ›
        </button>
      </div>

      {/* Dot indicators */}
      <div className="flex justify-center gap-2">
        {Array.from({ length: total }).map((_, i) => (
          <button
            key={i}
            onClick={() => setIndex(i)}
            className={`w-2 h-2 rounded-full transition-all ${
              i === safeIndex
                ? 'bg-indigo-400 scale-125'
                : 'bg-zinc-600 hover:bg-zinc-400'
            }`}
            aria-label={`Card ${i + 1}`}
          />
        ))}
      </div>

      {/* Charts — only when results are loaded */}
      {!isLoading && results.length > 0 && (
        <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
          <LatencyChart results={results} />
          <CostChart results={results} />
        </div>
      )}
    </div>
  )
}

'use client'

import type { ModelResult } from '@/app/page'
import ModelCard from './ModelCard'
import LatencyChart from './LatencyChart'
import CostChart from './CostChart'

interface Props {
  results: ModelResult[]
}

function findWinner(results: ModelResult[]): string | null {
  const successful = results.filter(r => r.error === null && r.latency_ms != null)
  if (successful.length === 0) return null
  return successful.reduce((fastest, r) =>
    r.latency_ms! < fastest.latency_ms! ? r : fastest
  ).model
}

export default function ResultsGrid({ results }: Props) {
  const winner = findWinner(results)

  return (
    <div className="flex flex-col gap-8">
      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
        {results.map(result => (
          <ModelCard
            key={result.model}
            result={result}
            isWinner={result.model === winner}
          />
        ))}
      </div>

      <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
        <LatencyChart results={results} />
        <CostChart results={results} />
      </div>
    </div>
  )
}

'use client'

import { useState } from 'react'
import PromptInput from '@/components/PromptInput'
import ResultsGrid from '@/components/ResultsGrid'

const BACKEND = process.env.NEXT_PUBLIC_BACKEND_URL ?? 'http://localhost:8000'

export interface ModelResult {
  model: string
  response: string | null
  latency_ms: number | null
  input_tokens: number | null
  output_tokens: number | null
  cost_usd: number | null
  error: string | null
}

export default function Home() {
  const [results, setResults] = useState<ModelResult[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  async function handleSubmit(prompt: string, models: string[]) {
    setIsLoading(true)
    setError(null)
    setResults([])
    try {
      const res = await fetch(`${BACKEND}/evaluate`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ prompt, models }),
      })
      if (!res.ok) throw new Error(`Server error: ${res.status}`)
      const data = await res.json()
      setResults(data.results)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Something went wrong')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <main className="min-h-screen bg-zinc-900 text-zinc-100 px-4 py-10">
      <div className="mx-auto max-w-5xl flex flex-col gap-10">
        <header className="flex flex-col gap-1">
          <h1 className="text-3xl font-bold tracking-tight">Prompt Arena</h1>
          <p className="text-zinc-400 text-sm">Run once. Compare everything.</p>
        </header>

        <PromptInput onSubmit={handleSubmit} isLoading={isLoading} />

        {error && (
          <p className="text-red-400 text-sm">{error}</p>
        )}

        {results.length > 0 && <ResultsGrid results={results} />}
      </div>
    </main>
  )
}

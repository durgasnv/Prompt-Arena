'use client'

import { useState } from 'react'
import PromptInput from '@/components/PromptInput'
import ResultsGrid from '@/components/ResultsGrid'
import HistoryPanel, { saveToHistory, type HistoryEntry } from '@/components/HistoryPanel'
import dynamic from 'next/dynamic'

const BlurText = dynamic(() => import('@/components/BlurText'), { ssr: false })
const Strands = dynamic(() => import('@/components/Strands'), { ssr: false })
const LiquidEther = dynamic(() => import('@/components/LiquidEther'), { ssr: false })

const BACKEND = process.env.NEXT_PUBLIC_BACKEND_URL ?? 'http://localhost:8000'
const POLL_INTERVAL_MS = 800

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
  const [historyKey, setHistoryKey] = useState(0)
  const [expectedCount, setExpectedCount] = useState(0)

  async function handleSubmit(prompt: string, models: string[]) {
    setIsLoading(true)
    setError(null)
    setResults([])
    setExpectedCount(models.length)

    try {
      const res = await fetch(`${BACKEND}/evaluate`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ prompt, models }),
      })
      if (!res.ok) throw new Error(`Server error: ${res.status}`)
      const { job_id } = await res.json()

      // Poll until done
      let finalResults: ModelResult[] = []
      while (true) {
        await new Promise(r => setTimeout(r, POLL_INTERVAL_MS))
        const poll = await fetch(`${BACKEND}/evaluate/${job_id}`)
        if (!poll.ok) throw new Error(`Poll error: ${poll.status}`)
        const data: { results: ModelResult[]; done: boolean } = await poll.json()

        setResults([...data.results])
        finalResults = data.results

        if (data.done) break
      }

      saveToHistory({ prompt, models, results: finalResults })
      setHistoryKey(k => k + 1)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Something went wrong')
    } finally {
      setIsLoading(false)
    }
  }

  function handleHistorySelect(entry: HistoryEntry) {
    setResults(entry.results)
    setExpectedCount(entry.results.length)
    setError(null)
  }

  return (
    <main className="min-h-screen bg-zinc-900 text-zinc-100">

      {/* Hero: LiquidEther bg + Strands overlay + BlurText title */}
      <div className="relative w-full h-56 overflow-hidden">
        <div className="absolute inset-0">
          <LiquidEther
            colors={['#1e1b4b', '#312e81', '#4338ca']}
            autoSpeed={0.3}
            autoIntensity={1.8}
            className=""
            style={{}}
          />
        </div>
        <div className="absolute inset-0">
          <Strands
            colors={['#6366f1', '#8b5cf6', '#06b6d4']}
            count={3}
            speed={0.4}
            amplitude={0.7}
            opacity={0.75}
            glow={2}
            style={{}}
          />
        </div>
        <div className="absolute inset-0 flex flex-col items-center justify-center gap-2">
          <BlurText
            text="Prompt Arena"
            delay={100}
            animateBy="words"
            direction="top"
            className="text-4xl font-bold tracking-tight text-white drop-shadow-lg"
          />
          <p className="text-zinc-300 text-sm drop-shadow">Run once. Compare everything.</p>
        </div>
      </div>

      <div className="mx-auto max-w-5xl flex flex-col gap-10 px-4 py-10">

        <PromptInput onSubmit={handleSubmit} isLoading={isLoading} />

        <HistoryPanel onSelect={handleHistorySelect} refreshKey={historyKey} />

        {error && <p className="text-red-400 text-sm">{error}</p>}

        {(isLoading || results.length > 0) && (
          <ResultsGrid results={results} isLoading={isLoading} modelCount={expectedCount} />
        )}
      </div>
    </main>
  )
}

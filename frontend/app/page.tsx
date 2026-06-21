'use client'

import { useState } from 'react'
import PromptInput from '@/components/PromptInput'
import ResultsGrid from '@/components/ResultsGrid'
import HistoryPanel, { saveToHistory, type HistoryEntry } from '@/components/HistoryPanel'
import dynamic from 'next/dynamic'

const BlurText = dynamic(() => import('@/components/BlurText'), { ssr: false })
const ElectricBorder = dynamic(() => import('@/components/ElectricBorder'), { ssr: false })
const Strands = dynamic(() => import('@/components/Strands'), { ssr: false })
const LiquidEther = dynamic(() => import('@/components/LiquidEther'), { ssr: false })

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
  const [historyKey, setHistoryKey] = useState(0)

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
      saveToHistory({ prompt, models, results: data.results })
      setHistoryKey(k => k + 1)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Something went wrong')
    } finally {
      setIsLoading(false)
    }
  }

  function handleHistorySelect(entry: HistoryEntry) {
    setResults(entry.results)
    setError(null)
  }

  return (
    <main className="min-h-screen bg-zinc-900 text-zinc-100">

      {/* Hero: LiquidEther bg + Strands overlay + BlurText title */}
      <div className="relative w-full h-56 overflow-hidden">
        <div className="absolute inset-0">
          <LiquidEther
            colors={['#1e1b4b', '#312e81', '#4338ca']}
            autoDemo={true}
            autoSpeed={0.3}
            autoIntensity={1.8}
            mouseForce={15}
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

        {/* ElectricBorder wraps the prompt form */}
        <ElectricBorder color="#6366f1" speed={0.8} chaos={0.1} borderRadius={16}>
          <PromptInput onSubmit={handleSubmit} isLoading={isLoading} />
        </ElectricBorder>

        <HistoryPanel onSelect={handleHistorySelect} refreshKey={historyKey} />

        {error && <p className="text-red-400 text-sm">{error}</p>}

        {(isLoading || results.length > 0) && (
          <ResultsGrid results={results} isLoading={isLoading} modelCount={5} />
        )}
      </div>
    </main>
  )
}

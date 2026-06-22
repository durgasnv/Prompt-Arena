'use client'

import { useState } from 'react'
import Header from '@/components/Header'
import Hero, { type Motion } from '@/components/Hero'
import PromptInput from '@/components/PromptInput'
import ResultsGrid from '@/components/ResultsGrid'
import HistoryPanel, { saveToHistory, type HistoryEntry } from '@/components/HistoryPanel'
import AnalyticsZone from '@/components/AnalyticsZone'
import dynamic from 'next/dynamic'

const StatesBoard = dynamic(() => import('@/components/StatesBoard'), { ssr: false })

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

function ZoneLabel({ number, label }: { number: string; label: string }) {
  return (
    <div className="flex items-center gap-3">
      <span
        className="tabular-nums"
        style={{ fontSize: '10px', color: '#27272a', fontFamily: 'var(--font-jetbrains-mono)' }}
      >
        {number}
      </span>
      <div className="h-px flex-1" style={{ background: 'rgba(39,39,42,0.7)' }} />
      <span
        className="uppercase tracking-widest"
        style={{ fontSize: '9px', color: '#3f3f46', fontFamily: 'var(--font-jetbrains-mono)' }}
      >
        {label}
      </span>
    </div>
  )
}

const MOTION_OPTIONS: { value: Motion; label: string }[] = [
  { value: 'full',   label: 'Full'   },
  { value: 'subtle', label: 'Subtle' },
  { value: 'off',    label: 'Off'    },
]

export default function Home() {
  const [results, setResults]         = useState<ModelResult[]>([])
  const [isLoading, setIsLoading]     = useState(false)
  const [error, setError]             = useState<string | null>(null)
  const [historyKey, setHistoryKey]   = useState(0)
  const [expectedCount, setExpected]  = useState(0)
  const [motion, setMotion]           = useState<Motion>('full')
  const [showCharts, setShowCharts]   = useState(true)

  async function handleSubmit(prompt: string, models: string[]) {
    setIsLoading(true)
    setError(null)
    setResults([])
    setExpected(models.length)
    try {
      const res = await fetch(`${BACKEND}/evaluate`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ prompt, models }),
      })
      if (!res.ok) throw new Error(`Server error: ${res.status}`)
      const { job_id } = await res.json()

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
    setExpected(entry.results.length)
    setError(null)
  }

  return (
    <>
      <Header />
      <Hero motion={motion} />

      {/* Tweaks bar */}
      <div
        className="border-b"
        style={{ background: 'rgba(9,9,11,0.95)', borderColor: 'rgba(39,39,42,0.5)' }}
      >
        <div className="mx-auto max-w-5xl flex items-center gap-5 px-4 py-2.5 flex-wrap">
          {/* Motion toggle */}
          <div className="flex items-center gap-2">
            <span
              className="text-[10px] uppercase tracking-widest"
              style={{ color: '#3f3f46', fontFamily: 'var(--font-jetbrains-mono)' }}
            >
              Motion
            </span>
            <div className="flex rounded-lg border overflow-hidden" style={{ borderColor: 'rgba(39,39,42,0.8)' }}>
              {MOTION_OPTIONS.map(opt => (
                <button
                  key={opt.value}
                  onClick={() => setMotion(opt.value)}
                  className="px-2.5 py-1 text-[11px] transition-colors"
                  style={{
                    fontFamily: 'var(--font-manrope)',
                    background: motion === opt.value ? 'rgba(99,102,241,0.2)' : 'transparent',
                    color: motion === opt.value ? '#a5b4fc' : '#52525b',
                    borderRight: opt.value !== 'off' ? '1px solid rgba(39,39,42,0.8)' : 'none',
                  }}
                >
                  {opt.label}
                </button>
              ))}
            </div>
          </div>

          {/* Charts toggle */}
          <div className="flex items-center gap-2">
            <span
              className="text-[10px] uppercase tracking-widest"
              style={{ color: '#3f3f46', fontFamily: 'var(--font-jetbrains-mono)' }}
            >
              Charts
            </span>
            <button
              onClick={() => setShowCharts(s => !s)}
              className="rounded-lg border px-2.5 py-1 text-[11px] transition-colors"
              style={{
                fontFamily: 'var(--font-manrope)',
                borderColor: 'rgba(39,39,42,0.8)',
                background: showCharts ? 'rgba(99,102,241,0.18)' : 'transparent',
                color: showCharts ? '#a5b4fc' : '#52525b',
              }}
            >
              {showCharts ? 'On' : 'Off'}
            </button>
          </div>
        </div>
      </div>

      {/* Main content */}
      <main className="mx-auto w-full max-w-5xl flex flex-col gap-8 px-4 py-10">

        <div className="flex flex-col gap-4">
          <ZoneLabel number="01" label="Input" />
          <PromptInput onSubmit={handleSubmit} isLoading={isLoading} />
        </div>

        <HistoryPanel onSelect={handleHistorySelect} refreshKey={historyKey} />

        {error && (
          <p
            className="text-sm"
            style={{ color: '#f87171', fontFamily: 'var(--font-manrope)' }}
          >
            {error}
          </p>
        )}

        {(isLoading || results.length > 0) && (
          <div className="flex flex-col gap-4">
            <ZoneLabel number="02" label="Results" />
            <ResultsGrid results={results} isLoading={isLoading} modelCount={expectedCount} />
          </div>
        )}

        {results.length >= 2 && (
          <div className="flex flex-col gap-4">
            <ZoneLabel number="03" label="Analytics" />
            <AnalyticsZone results={results} showCharts={showCharts} />
          </div>
        )}

      </main>

      {/* States showcase */}
      <div className="mx-auto w-full max-w-5xl px-4 pb-16">
        <StatesBoard />
      </div>
    </>
  )
}

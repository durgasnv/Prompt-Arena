'use client'

import type { ModelResult } from '@/app/page'
import LatencyChart from './LatencyChart'
import CostChart from './CostChart'

const MODEL_LABELS: Record<string, string> = {
  llama4: 'Llama 4 Scout', gemma: 'Gemma 2 9B', groq: 'Llama 3.3 70B',
  cohere: 'Command R', mistral: 'Mistral Small',
}

interface Props {
  results: ModelResult[]
  showCharts: boolean
}

export default function AnalyticsZone({ results, showCharts }: Props) {
  if (results.length < 2) return null

  const successful = results.filter(r => r.error === null && r.latency_ms != null)
  const fastest = successful.length > 0
    ? successful.reduce((a, b) => a.latency_ms! < b.latency_ms! ? a : b)
    : null

  const withCost = results.filter(r => r.cost_usd != null)
  const cheapest = withCost.length > 0
    ? withCost.reduce((a, b) => a.cost_usd! < b.cost_usd! ? a : b)
    : null

  const avgLatency = successful.length > 0
    ? Math.round(successful.reduce((s, r) => s + r.latency_ms!, 0) / successful.length)
    : null

  const returned = results.filter(r => r.error === null).length

  return (
    <div className="flex flex-col gap-5">
      {/* Stat tiles */}
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        <StatTile
          label="Fastest"
          value={fastest ? (MODEL_LABELS[fastest.model] ?? fastest.model) : '—'}
          sub={fastest ? `${fastest.latency_ms} ms` : undefined}
          accent="indigo"
        />
        <StatTile
          label="Cheapest"
          value={cheapest ? (MODEL_LABELS[cheapest.model] ?? cheapest.model) : '—'}
          sub={cheapest ? (cheapest.cost_usd === 0 ? 'Free' : `$${cheapest.cost_usd!.toFixed(6)}`) : undefined}
          accent="emerald"
        />
        <StatTile
          label="Avg Latency"
          value={avgLatency != null ? `${avgLatency} ms` : '—'}
          accent="default"
        />
        <StatTile
          label="Returned"
          value={`${returned} / ${results.length}`}
          sub={returned === results.length ? 'All OK' : `${results.length - returned} errored`}
          accent={returned === results.length ? 'emerald' : 'red'}
        />
      </div>

      {/* Charts */}
      {showCharts && (
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
          <LatencyChart results={results} />
          <CostChart results={results} />
        </div>
      )}
    </div>
  )
}

type Accent = 'indigo' | 'emerald' | 'red' | 'default'

const ACCENT_STYLES: Record<Accent, { border: string; glow: string; value: string; sub: string }> = {
  indigo:  { border: 'rgba(99,102,241,0.3)',  glow: '0 0 20px rgba(99,102,241,0.08)',  value: '#a5b4fc', sub: '#6366f1' },
  emerald: { border: 'rgba(52,211,153,0.3)',  glow: '0 0 20px rgba(52,211,153,0.08)',  value: '#34d399', sub: '#10b981' },
  red:     { border: 'rgba(248,113,113,0.3)', glow: '0 0 20px rgba(248,113,113,0.08)', value: '#f87171', sub: '#ef4444' },
  default: { border: 'rgba(39,39,42,0.8)',    glow: 'none',                             value: '#71717a', sub: '#52525b' },
}

function StatTile({ label, value, sub, accent }: { label: string; value: string; sub?: string; accent: Accent }) {
  const s = ACCENT_STYLES[accent]
  return (
    <div
      className="rounded-2xl border p-4 flex flex-col gap-1.5"
      style={{ background: '#141417', borderColor: s.border, boxShadow: s.glow }}
    >
      <span
        className="uppercase tracking-widest"
        style={{ fontSize: '9px', color: '#3f3f46', fontFamily: 'var(--font-jetbrains-mono)' }}
      >
        {label}
      </span>
      <span
        className="text-sm font-bold leading-tight"
        style={{ color: s.value, fontFamily: 'var(--font-space-grotesk)' }}
      >
        {value}
      </span>
      {sub && (
        <span
          className="text-[11px]"
          style={{ color: s.sub, fontFamily: 'var(--font-jetbrains-mono)' }}
        >
          {sub}
        </span>
      )}
    </div>
  )
}

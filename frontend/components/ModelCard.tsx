'use client'

import { useState } from 'react'
import type { ModelResult } from '@/app/page'
import WinnerBadge from './WinnerBadge'

const MODEL_LABELS: Record<string, string> = {
  llama4:  'Llama 4 Scout',
  gemma:   'Gemma 2 9B',
  groq:    'Llama 3.3 70B',
  cohere:  'Command R',
  mistral: 'Mistral Small',
}

const MODEL_DOTS: Record<string, string> = {
  llama4:  '#f97316',
  gemma:   '#22c55e',
  groq:    '#a78bfa',
  cohere:  '#38bdf8',
  mistral: '#f59e0b',
}

interface Props {
  result: ModelResult
  isWinner: boolean
}

export default function ModelCard({ result, isWinner }: Props) {
  const { model, response, latency_ms, input_tokens, output_tokens, cost_usd, error } = result
  const label = MODEL_LABELS[model] ?? model
  const dot = MODEL_DOTS[model] ?? '#6366f1'
  const [copied, setCopied] = useState(false)

  const copy = () => {
    if (!response) return
    navigator.clipboard.writeText(response).then(() => {
      setCopied(true)
      setTimeout(() => setCopied(false), 1500)
    })
  }

  const borderColor = error
    ? 'rgba(248,113,113,0.38)'
    : isWinner
    ? 'rgba(99,102,241,0.55)'
    : 'rgba(39,39,42,0.8)'

  const glow = error
    ? '0 0 30px rgba(248,113,113,0.18), inset 0 1px 0 rgba(248,113,113,0.04)'
    : isWinner
    ? '0 0 48px rgba(99,102,241,0.28), 0 0 96px rgba(99,102,241,0.1), inset 0 1px 0 rgba(99,102,241,0.08)'
    : '0 0 24px rgba(99,102,241,0.05), inset 0 1px 0 rgba(255,255,255,0.02)'

  return (
    <div
      className="relative flex flex-col gap-4 rounded-2xl border p-6 min-h-72 transition-all duration-300"
      style={{ background: '#141417', borderColor, boxShadow: glow }}
    >
      {isWinner && <WinnerBadge />}

      {/* Header */}
      <div className="flex items-center justify-between gap-2 mt-1">
        <div className="flex items-center gap-2.5">
          <div
            className="w-2 h-2 rounded-full flex-shrink-0"
            style={{ background: dot, boxShadow: `0 0 6px ${dot}88` }}
          />
          <span
            className="text-sm font-bold text-zinc-100 tracking-tight"
            style={{ fontFamily: 'var(--font-space-grotesk)' }}
          >
            {label}
          </span>
        </div>
        <div className="flex items-center gap-2.5">
          {latency_ms != null && (
            <span
              className="text-xs font-medium px-2.5 py-0.5 rounded-full"
              style={{
                fontFamily: 'var(--font-jetbrains-mono)',
                background: isWinner ? 'rgba(99,102,241,0.18)' : 'rgba(39,39,42,0.9)',
                color: isWinner ? '#a5b4fc' : '#52525b',
              }}
            >
              {latency_ms} ms
            </span>
          )}
          {response && (
            <button
              onClick={copy}
              className="text-xs transition-colors"
              style={{
                color: copied ? '#34d399' : '#3f3f46',
                fontFamily: 'var(--font-manrope)',
              }}
            >
              {copied ? '✓ Copied' : 'Copy'}
            </button>
          )}
        </div>
      </div>

      {/* Body */}
      {error ? (
        <div className="flex-1 flex items-center justify-center px-4">
          <p
            className="text-sm text-center leading-relaxed"
            style={{ color: '#f87171', fontFamily: 'var(--font-manrope)' }}
          >
            {error}
          </p>
        </div>
      ) : (
        <div className="flex-1 overflow-y-auto max-h-64">
          <p
            className="text-zinc-300 whitespace-pre-wrap leading-7"
            style={{ fontFamily: 'var(--font-jetbrains-mono)', fontSize: '0.8rem' }}
          >
            {response}
          </p>
        </div>
      )}

      {/* Footer stats */}
      {!error && (
        <div
          className="flex gap-6 border-t pt-3.5 mt-auto"
          style={{ borderColor: 'rgba(39,39,42,0.8)' }}
        >
          <Stat label="Tokens in"  value={input_tokens  ?? '—'} />
          <Stat label="Tokens out" value={output_tokens ?? '—'} />
          <Stat
            label="Cost"
            value={cost_usd != null ? (cost_usd === 0 ? 'Free' : `$${cost_usd.toFixed(6)}`) : '—'}
            highlight={cost_usd === 0}
          />
        </div>
      )}
    </div>
  )
}

function Stat({ label, value, highlight }: { label: string; value: string | number; highlight?: boolean }) {
  return (
    <div className="flex flex-col gap-1">
      <span
        className="uppercase tracking-widest"
        style={{ fontSize: '9px', color: '#3f3f46', fontFamily: 'var(--font-jetbrains-mono)' }}
      >
        {label}
      </span>
      <span
        className="text-xs font-semibold"
        style={{
          color: highlight ? '#34d399' : '#71717a',
          fontFamily: 'var(--font-jetbrains-mono)',
        }}
      >
        {value}
      </span>
    </div>
  )
}

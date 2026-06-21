'use client'

import { useState } from 'react'
import type { ModelResult } from '@/app/page'
import WinnerBadge from './WinnerBadge'

const MODEL_LABELS: Record<string, string> = {
  llama4:  'Llama 4 Scout',
  gemma:   'Gemma 4 31B',
  groq:    'Llama 3.3 70B',
  cohere:  'Command R',
  mistral: 'Mistral Small',
}

interface Props {
  result: ModelResult
  isWinner: boolean
}

export default function ModelCard({ result, isWinner }: Props) {
  const { model, response, latency_ms, input_tokens, output_tokens, cost_usd, error } = result
  const label = MODEL_LABELS[model] ?? model
  const [copied, setCopied] = useState(false)

  const copy = () => {
    if (!response) return
    navigator.clipboard.writeText(response).then(() => {
      setCopied(true)
      setTimeout(() => setCopied(false), 1500)
    })
  }

  const glowStyle = error
    ? { boxShadow: '0 0 24px 4px rgba(239,68,68,0.25)' }
    : isWinner
    ? { boxShadow: '0 0 32px 6px rgba(99,102,241,0.45)' }
    : { boxShadow: '0 0 16px 2px rgba(99,102,241,0.1)' }

  return (
    <div
      className={`relative flex flex-col gap-4 rounded-2xl border p-6 min-h-72 transition-shadow ${
        error
          ? 'border-red-800/60 bg-zinc-900'
          : isWinner
          ? 'border-indigo-500/70 bg-zinc-800/90'
          : 'border-zinc-700/60 bg-zinc-800/80'
      }`}
      style={glowStyle}
    >
      {isWinner && <WinnerBadge />}

      {/* Header */}
      <div className="flex items-center justify-between gap-2">
        <span className="text-base font-bold text-zinc-100 tracking-tight">{label}</span>
        <div className="flex items-center gap-3">
          {latency_ms != null && (
            <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${
              isWinner ? 'bg-indigo-500/20 text-indigo-300' : 'bg-zinc-700 text-zinc-400'
            }`}>
              {latency_ms} ms
            </span>
          )}
          {response && (
            <button
              onClick={copy}
              className="text-xs text-zinc-500 hover:text-zinc-200 transition-colors"
              title="Copy response"
            >
              {copied ? '✓ Copied' : 'Copy'}
            </button>
          )}
        </div>
      </div>

      {/* Body */}
      {error ? (
        <div className="flex-1 flex items-center justify-center">
          <p className="text-sm text-red-400 leading-relaxed text-center px-4">{error}</p>
        </div>
      ) : (
        <div className="flex-1 overflow-y-auto max-h-64 scrollbar-thin">
          <p className="text-sm text-zinc-300 leading-7 whitespace-pre-wrap font-mono">
            {response}
          </p>
        </div>
      )}

      {/* Footer stats */}
      {!error && (
        <div className="flex gap-5 border-t border-zinc-700/50 pt-3 mt-auto">
          <Stat label="Tokens in" value={input_tokens ?? '—'} />
          <Stat label="Tokens out" value={output_tokens ?? '—'} />
          <Stat
            label="Cost"
            value={cost_usd != null ? `$${cost_usd.toFixed(6)}` : '—'}
            highlight={cost_usd === 0}
          />
        </div>
      )}
    </div>
  )
}

function Stat({ label, value, highlight }: { label: string; value: string | number; highlight?: boolean }) {
  return (
    <div className="flex flex-col gap-0.5">
      <span className="text-[10px] uppercase tracking-widest text-zinc-500">{label}</span>
      <span className={`text-xs font-semibold ${highlight ? 'text-emerald-400' : 'text-zinc-300'}`}>{value}</span>
    </div>
  )
}

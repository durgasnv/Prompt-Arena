'use client'

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

  return (
    <div className={`relative flex flex-col gap-3 rounded-2xl border p-5 ${
      error
        ? 'border-red-800 bg-zinc-900'
        : isWinner
        ? 'border-indigo-500 bg-zinc-800'
        : 'border-zinc-700 bg-zinc-800'
    }`}>
      {isWinner && <WinnerBadge />}

      <div className="flex items-center justify-between">
        <span className="text-sm font-semibold text-zinc-100">{label}</span>
        {latency_ms != null && (
          <span className="text-xs text-zinc-400">{latency_ms} ms</span>
        )}
      </div>

      {error ? (
        <p className="text-xs text-red-400 leading-relaxed">{error}</p>
      ) : (
        <p className="text-sm text-zinc-300 leading-relaxed whitespace-pre-wrap flex-1">
          {response}
        </p>
      )}

      {!error && (
        <div className="flex gap-4 border-t border-zinc-700 pt-3 mt-auto">
          <Stat label="In" value={input_tokens ?? '—'} />
          <Stat label="Out" value={output_tokens ?? '—'} />
          <Stat
            label="Cost"
            value={cost_usd != null ? `$${cost_usd.toFixed(6)}` : '—'}
          />
        </div>
      )}
    </div>
  )
}

function Stat({ label, value }: { label: string; value: string | number }) {
  return (
    <div className="flex flex-col gap-0.5">
      <span className="text-[10px] uppercase tracking-wide text-zinc-500">{label}</span>
      <span className="text-xs font-medium text-zinc-300">{value}</span>
    </div>
  )
}

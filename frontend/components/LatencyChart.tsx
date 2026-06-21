'use client'

import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell } from 'recharts'
import type { ModelResult } from '@/app/page'

const MODEL_LABELS: Record<string, string> = {
  llama4:  'Llama 4',
  gemma:   'Gemma 4',
  groq:    'Llama 3.3',
  cohere:  'Command R',
  mistral: 'Mistral',
}

interface Props {
  results: ModelResult[]
}

export default function LatencyChart({ results }: Props) {
  const data = results
    .filter(r => r.latency_ms != null)
    .map(r => ({ name: MODEL_LABELS[r.model] ?? r.model, latency: r.latency_ms }))

  if (data.length === 0) return null

  const min = Math.min(...data.map(d => d.latency as number))

  return (
    <div className="rounded-2xl border border-zinc-700 bg-zinc-800 p-5 flex flex-col gap-3">
      <h3 className="text-sm font-semibold text-zinc-100">Latency (ms)</h3>
      <ResponsiveContainer width="100%" height={200}>
        <BarChart data={data} margin={{ top: 4, right: 8, left: -16, bottom: 0 }}>
          <XAxis dataKey="name" tick={{ fill: '#a1a1aa', fontSize: 11 }} />
          <YAxis tick={{ fill: '#a1a1aa', fontSize: 11 }} />
          <Tooltip
            contentStyle={{ background: '#27272a', border: 'none', borderRadius: 8 }}
            labelStyle={{ color: '#f4f4f5' }}
            formatter={(v) => [`${Number(v)} ms`, 'Latency']}
          />
          <Bar dataKey="latency" radius={[6, 6, 0, 0]}>
            {data.map(d => (
              <Cell
                key={d.name}
                fill={d.latency === min ? '#6366f1' : '#3f3f46'}
              />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </div>
  )
}

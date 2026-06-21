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

export default function CostChart({ results }: Props) {
  const data = results
    .filter(r => r.cost_usd != null)
    .map(r => ({ name: MODEL_LABELS[r.model] ?? r.model, cost: r.cost_usd }))

  if (data.length === 0) return null

  const max = Math.max(...data.map(d => d.cost as number))

  return (
    <div className="rounded-2xl border border-zinc-700 bg-zinc-800 p-5 flex flex-col gap-3">
      <h3 className="text-sm font-semibold text-zinc-100">Cost (USD)</h3>
      <ResponsiveContainer width="100%" height={200}>
        <BarChart data={data} margin={{ top: 4, right: 8, left: 0, bottom: 0 }}>
          <XAxis dataKey="name" tick={{ fill: '#a1a1aa', fontSize: 11 }} />
          <YAxis tick={{ fill: '#a1a1aa', fontSize: 11 }} tickFormatter={v => `$${v.toFixed(5)}`} />
          <Tooltip
            contentStyle={{ background: '#27272a', border: 'none', borderRadius: 8 }}
            labelStyle={{ color: '#f4f4f5' }}
            formatter={(v: number) => [`$${v.toFixed(6)}`, 'Cost']}
          />
          <Bar dataKey="cost" radius={[6, 6, 0, 0]}>
            {data.map(d => (
              <Cell
                key={d.name}
                fill={d.cost === max ? '#f87171' : '#3f3f46'}
              />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </div>
  )
}

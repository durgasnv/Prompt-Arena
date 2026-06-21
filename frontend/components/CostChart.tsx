'use client'

import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell } from 'recharts'
import type { ModelResult } from '@/app/page'

const MODEL_LABELS: Record<string, string> = {
  llama4: 'Llama 4', gemma: 'Gemma 4', groq: 'Llama 3.3', cohere: 'Command R', mistral: 'Mistral',
}

export default function CostChart({ results }: { results: ModelResult[] }) {
  const data = results
    .filter(r => r.cost_usd != null)
    .map(r => ({ name: MODEL_LABELS[r.model] ?? r.model, cost: r.cost_usd }))
    .sort((a, b) => (a.cost as number) - (b.cost as number))

  if (data.length === 0) return null

  const max = Math.max(...data.map(d => d.cost as number))
  const min = Math.min(...data.map(d => d.cost as number))
  const cheapest = data.find(d => d.cost === min)

  return (
    <div className="rounded-2xl border border-zinc-700/60 bg-zinc-800/80 p-5 flex flex-col gap-4"
      style={{ boxShadow: '0 0 20px 2px rgba(99,102,241,0.08)' }}>
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-bold text-zinc-100 tracking-tight">💰 Cost</h3>
        {cheapest && (
          <span className="text-xs bg-emerald-500/20 text-emerald-300 px-2 py-0.5 rounded-full font-medium">
            Cheapest: {cheapest.name} (${Number(cheapest.cost).toFixed(6)})
          </span>
        )}
      </div>
      <ResponsiveContainer width="100%" height={180}>
        <BarChart data={data} margin={{ top: 4, right: 8, left: 0, bottom: 0 }}>
          <XAxis dataKey="name" tick={{ fill: '#71717a', fontSize: 11 }} axisLine={false} tickLine={false} />
          <YAxis tick={{ fill: '#71717a', fontSize: 11 }} axisLine={false} tickLine={false} tickFormatter={v => `$${Number(v).toFixed(5)}`} />
          <Tooltip
            contentStyle={{ background: '#18181b', border: '1px solid #3f3f46', borderRadius: 10 }}
            labelStyle={{ color: '#f4f4f5', fontWeight: 600 }}
            formatter={(v) => [`$${Number(v).toFixed(6)}`, 'Cost']}
            cursor={{ fill: 'rgba(99,102,241,0.05)' }}
          />
          <Bar dataKey="cost" radius={[6, 6, 0, 0]} maxBarSize={48}>
            {data.map(d => (
              <Cell
                key={d.name}
                fill={d.cost === max ? '#f87171' : d.cost === min ? '#34d399' : '#3f3f46'}
                style={d.cost === max ? { filter: 'drop-shadow(0 0 6px rgba(248,113,113,0.5))' } : {}}
              />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </div>
  )
}

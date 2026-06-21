'use client'

import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell } from 'recharts'
import type { ModelResult } from '@/app/page'

const MODEL_LABELS: Record<string, string> = {
  llama4: 'Llama 4', gemma: 'Gemma 4', groq: 'Llama 3.3', cohere: 'Command R', mistral: 'Mistral',
}

export default function LatencyChart({ results }: { results: ModelResult[] }) {
  const data = results
    .filter(r => r.latency_ms != null)
    .map(r => ({ name: MODEL_LABELS[r.model] ?? r.model, latency: r.latency_ms }))
    .sort((a, b) => (a.latency as number) - (b.latency as number))

  if (data.length === 0) return null

  const min = Math.min(...data.map(d => d.latency as number))
  const fastest = data.find(d => d.latency === min)

  return (
    <div className="rounded-2xl border border-zinc-700/60 bg-zinc-800/80 p-5 flex flex-col gap-4"
      style={{ boxShadow: '0 0 20px 2px rgba(99,102,241,0.08)' }}>
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-bold text-zinc-100 tracking-tight">⚡ Latency</h3>
        {fastest && (
          <span className="text-xs bg-indigo-500/20 text-indigo-300 px-2 py-0.5 rounded-full font-medium">
            Fastest: {fastest.name} ({fastest.latency} ms)
          </span>
        )}
      </div>
      <ResponsiveContainer width="100%" height={180}>
        <BarChart data={data} margin={{ top: 4, right: 8, left: -16, bottom: 0 }}>
          <XAxis dataKey="name" tick={{ fill: '#71717a', fontSize: 11 }} axisLine={false} tickLine={false} />
          <YAxis tick={{ fill: '#71717a', fontSize: 11 }} axisLine={false} tickLine={false} />
          <Tooltip
            contentStyle={{ background: '#18181b', border: '1px solid #3f3f46', borderRadius: 10 }}
            labelStyle={{ color: '#f4f4f5', fontWeight: 600 }}
            formatter={(v) => [`${Number(v)} ms`, 'Latency']}
            cursor={{ fill: 'rgba(99,102,241,0.05)' }}
          />
          <Bar dataKey="latency" radius={[6, 6, 0, 0]} maxBarSize={48}>
            {data.map(d => (
              <Cell
                key={d.name}
                fill={d.latency === min ? '#6366f1' : '#3f3f46'}
                style={d.latency === min ? { filter: 'drop-shadow(0 0 6px rgba(99,102,241,0.6))' } : {}}
              />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </div>
  )
}

'use client'

import { useEffect, useRef, useState } from 'react'
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell } from 'recharts'
import type { ModelResult } from '@/app/page'

const MODEL_LABELS: Record<string, string> = {
  llama4: 'Llama 4', gemma: 'Gemma 2', groq: 'Llama 3.3', cohere: 'Cmd R', mistral: 'Mistral',
}

export default function LatencyChart({ results }: { results: ModelResult[] }) {
  const ref = useRef<HTMLDivElement>(null)
  const [visible, setVisible] = useState(false)

  useEffect(() => {
    if (!ref.current) return
    const obs = new IntersectionObserver(
      ([e]) => { if (e.isIntersecting) { setVisible(true); obs.disconnect() } },
      { threshold: 0.15 },
    )
    obs.observe(ref.current)
    return () => obs.disconnect()
  }, [])

  const data = results
    .filter(r => r.latency_ms != null)
    .map(r => ({ name: MODEL_LABELS[r.model] ?? r.model, latency: r.latency_ms }))
    .sort((a, b) => (a.latency as number) - (b.latency as number))

  if (data.length === 0) return null

  const min = Math.min(...data.map(d => d.latency as number))
  const fastest = data.find(d => d.latency === min)

  return (
    <div
      ref={ref}
      className="rounded-2xl border p-5 flex flex-col gap-4"
      style={{
        background: '#141417',
        borderColor: 'rgba(39,39,42,0.8)',
        boxShadow: '0 0 24px rgba(99,102,241,0.05)',
        opacity: visible ? 1 : 0,
        transform: visible ? 'translateY(0)' : 'translateY(14px)',
        transition: 'opacity 0.5s ease, transform 0.5s ease',
      }}
    >
      <div className="flex items-center justify-between flex-wrap gap-2">
        <h3
          className="text-sm font-bold text-zinc-100"
          style={{ fontFamily: 'var(--font-space-grotesk)' }}
        >
          Latency
        </h3>
        {fastest && (
          <span
            className="text-[11px] px-2.5 py-0.5 rounded-full font-medium"
            style={{
              background: 'rgba(99,102,241,0.14)',
              color: '#a5b4fc',
              fontFamily: 'var(--font-jetbrains-mono)',
            }}
          >
            Fastest: {fastest.name} · {fastest.latency} ms
          </span>
        )}
      </div>

      {visible && (
        <ResponsiveContainer width="100%" height={180}>
          <BarChart data={data} margin={{ top: 4, right: 8, left: -18, bottom: 0 }}>
            <XAxis
              dataKey="name"
              tick={{ fill: '#52525b', fontSize: 11, fontFamily: 'var(--font-jetbrains-mono)' }}
              axisLine={false} tickLine={false}
            />
            <YAxis
              tick={{ fill: '#52525b', fontSize: 11, fontFamily: 'var(--font-jetbrains-mono)' }}
              axisLine={false} tickLine={false}
            />
            <Tooltip
              contentStyle={{ background: '#0d0d10', border: '1px solid #27272a', borderRadius: 10 }}
              labelStyle={{ color: '#f4f4f5', fontWeight: 600, fontFamily: 'var(--font-manrope)' }}
              itemStyle={{ fontFamily: 'var(--font-jetbrains-mono)', fontSize: 12 }}
              formatter={(v) => [`${Number(v)} ms`, 'Latency']}
              cursor={{ fill: 'rgba(99,102,241,0.04)' }}
            />
            <Bar dataKey="latency" radius={[6, 6, 0, 0]} maxBarSize={44} isAnimationActive>
              {data.map(d => (
                <Cell
                  key={d.name}
                  fill={d.latency === min ? '#6366f1' : '#27272a'}
                  style={d.latency === min ? { filter: 'drop-shadow(0 0 8px rgba(99,102,241,0.75))' } : {}}
                />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      )}
    </div>
  )
}

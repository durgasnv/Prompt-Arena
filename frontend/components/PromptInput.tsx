'use client'

import { useState } from 'react'

const MODELS = [
  { id: 'llama4',  label: 'Llama 4 Scout' },
  { id: 'gemma',   label: 'Llama 3.1 8B'  },
  { id: 'groq',    label: 'Llama 3.3 70B' },
  { id: 'cohere',  label: 'Command R'     },
  { id: 'mistral', label: 'Mistral Small' },
]

interface Props {
  onSubmit: (prompt: string, models: string[]) => void
  isLoading: boolean
}

export default function PromptInput({ onSubmit, isLoading }: Props) {
  const [prompt, setPrompt] = useState('')
  const [selected, setSelected] = useState<string[]>(MODELS.map(m => m.id))

  function toggle(id: string) {
    setSelected(prev => prev.includes(id) ? prev.filter(m => m !== id) : [...prev, id])
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!prompt.trim() || selected.length === 0 || isLoading) return
    onSubmit(prompt.trim(), selected)
  }

  function handleKeyDown(e: React.KeyboardEvent<HTMLTextAreaElement>) {
    if ((e.ctrlKey || e.metaKey) && e.key === 'Enter') {
      e.preventDefault()
      if (!prompt.trim() || selected.length === 0 || isLoading) return
      onSubmit(prompt.trim(), selected)
    }
  }

  const canRun = prompt.trim().length > 0 && selected.length > 0 && !isLoading

  return (
    <form onSubmit={handleSubmit} className="w-full flex flex-col gap-5">

      {/* Electric border wrapper */}
      <div
        className="electric-border-wrap rounded-2xl"
        style={{ padding: 1.5, borderRadius: 16 }}
      >
        <div
          className="relative rounded-2xl"
          style={{ background: '#141417', borderRadius: 14 }}
        >
          <textarea
            value={prompt}
            onChange={e => setPrompt(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Enter your prompt…"
            rows={6}
            className="w-full p-5 text-zinc-100 placeholder-zinc-700 resize-none focus:outline-none text-sm leading-relaxed"
            style={{
              background: 'transparent',
              fontFamily: 'var(--font-manrope)',
              borderRadius: 14,
            }}
          />
          <span
            className="absolute bottom-3 right-4 select-none text-[11px]"
            style={{ color: '#3f3f46', fontFamily: 'var(--font-jetbrains-mono)' }}
          >
            {prompt.length}
          </span>
        </div>
      </div>

      {/* Model chips + Run */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div className="flex flex-wrap gap-2">
          {MODELS.map(m => {
            const on = selected.includes(m.id)
            return (
              <button
                key={m.id}
                type="button"
                onClick={() => toggle(m.id)}
                className="rounded-full border px-3.5 py-1.5 text-xs font-medium transition-all duration-150"
                style={{
                  fontFamily: 'var(--font-manrope)',
                  background: on ? 'rgba(99,102,241,0.12)' : 'transparent',
                  borderColor: on ? 'rgba(99,102,241,0.55)' : 'rgba(39,39,42,0.9)',
                  color: on ? '#a5b4fc' : '#52525b',
                  boxShadow: on ? '0 0 12px rgba(99,102,241,0.12)' : 'none',
                }}
              >
                {m.label}
              </button>
            )
          })}
        </div>

        <button
          type="submit"
          disabled={!canRun}
          className="flex-shrink-0 rounded-xl px-7 py-2.5 text-sm font-semibold transition-all duration-200 disabled:opacity-40 disabled:cursor-not-allowed"
          style={{
            fontFamily: 'var(--font-manrope)',
            background: '#6366f1',
            color: '#ffffff',
            boxShadow: canRun
              ? '0 0 24px rgba(99,102,241,0.45), 0 4px 16px rgba(99,102,241,0.25)'
              : 'none',
          }}
        >
          {isLoading ? 'Running…' : 'Run'}
        </button>
      </div>
    </form>
  )
}

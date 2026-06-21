'use client'

import { useState } from 'react'

const MODELS = [
  { id: 'llama4',  label: 'Llama 4 Scout' },
  { id: 'gemma',   label: 'Gemma 4 31B'   },
  { id: 'groq',    label: 'Llama 3.3 70B' },
  { id: 'cohere',  label: 'Command R'      },
  { id: 'mistral', label: 'Mistral Small'  },
]

interface Props {
  onSubmit: (prompt: string, models: string[]) => void
  isLoading: boolean
}

export default function PromptInput({ onSubmit, isLoading }: Props) {
  const [prompt, setPrompt] = useState('')
  const [selected, setSelected] = useState<string[]>(MODELS.map(m => m.id))

  function toggle(id: string) {
    setSelected(prev =>
      prev.includes(id) ? prev.filter(m => m !== id) : [...prev, id]
    )
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!prompt.trim() || selected.length === 0 || isLoading) return
    onSubmit(prompt.trim(), selected)
  }

  return (
    <form onSubmit={handleSubmit} className="w-full flex flex-col gap-4">
      <textarea
        value={prompt}
        onChange={e => setPrompt(e.target.value)}
        placeholder="Enter your prompt here…"
        rows={5}
        className="w-full rounded-xl border border-zinc-700 bg-zinc-800 p-4 text-zinc-100 placeholder-zinc-500 resize-none focus:outline-none focus:ring-2 focus:ring-indigo-500"
      />

      <div className="flex flex-wrap gap-3">
        {MODELS.map(m => (
          <label key={m.id} className="flex items-center gap-2 cursor-pointer select-none">
            <input
              type="checkbox"
              checked={selected.includes(m.id)}
              onChange={() => toggle(m.id)}
              className="accent-indigo-500 w-4 h-4"
            />
            <span className="text-sm text-zinc-300">{m.label}</span>
          </label>
        ))}
      </div>

      <button
        type="submit"
        disabled={!prompt.trim() || selected.length === 0 || isLoading}
        className="self-end rounded-xl bg-indigo-600 px-6 py-2.5 text-sm font-semibold text-white hover:bg-indigo-500 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
      >
        {isLoading ? 'Running…' : 'Run'}
      </button>
    </form>
  )
}

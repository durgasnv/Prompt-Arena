'use client'

import { useState } from 'react'
import dynamic from 'next/dynamic'

const ElectricBorder = dynamic(() => import('./ElectricBorder'), { ssr: false })

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

  function handleKeyDown(e: React.KeyboardEvent<HTMLTextAreaElement>) {
    if ((e.ctrlKey || e.metaKey) && e.key === 'Enter') {
      e.preventDefault()
      if (!prompt.trim() || selected.length === 0 || isLoading) return
      onSubmit(prompt.trim(), selected)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="w-full flex flex-col gap-4">

      {/* Electric border only around the textarea */}
      <ElectricBorder color="#6366f1" speed={0.8} chaos={0.1} borderRadius={12} className="" style={{}}>
        <div className="relative">
          <textarea
            value={prompt}
            onChange={e => setPrompt(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Enter your prompt… (Ctrl+Enter to run)"
            rows={5}
            className="w-full rounded-xl bg-zinc-900 p-4 text-zinc-100 placeholder-zinc-500 resize-none focus:outline-none"
          />
          <span className="absolute bottom-2 right-3 text-[10px] text-zinc-600">
            {prompt.length} chars
          </span>
        </div>
      </ElectricBorder>

      <div className="flex flex-wrap items-center justify-between gap-3">
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
          className="rounded-xl bg-indigo-600 px-6 py-2.5 text-sm font-semibold text-white hover:bg-indigo-500 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
        >
          {isLoading ? 'Running…' : 'Run'}
        </button>
      </div>
    </form>
  )
}

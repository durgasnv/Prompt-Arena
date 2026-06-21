'use client'

import { useEffect, useState } from 'react'
import type { ModelResult } from '@/app/page'

export interface HistoryEntry {
  id: string
  prompt: string
  models: string[]
  results: ModelResult[]
  timestamp: number
}

const STORAGE_KEY = 'promptarena_history'
const MAX_ENTRIES = 20

export function loadHistory(): HistoryEntry[] {
  try {
    return JSON.parse(localStorage.getItem(STORAGE_KEY) ?? '[]')
  } catch {
    return []
  }
}

export function saveToHistory(entry: Omit<HistoryEntry, 'id' | 'timestamp'>) {
  const history = loadHistory()
  const next: HistoryEntry = {
    ...entry,
    id: crypto.randomUUID(),
    timestamp: Date.now(),
  }
  const updated = [next, ...history].slice(0, MAX_ENTRIES)
  localStorage.setItem(STORAGE_KEY, JSON.stringify(updated))
  return next
}

interface Props {
  onSelect: (entry: HistoryEntry) => void
  refreshKey: number
}

export default function HistoryPanel({ onSelect, refreshKey }: Props) {
  const [history, setHistory] = useState<HistoryEntry[]>([])
  const [open, setOpen] = useState(false)

  useEffect(() => {
    setHistory(loadHistory())
  }, [refreshKey])

  if (history.length === 0) return null

  return (
    <div className="flex flex-col gap-2">
      <button
        onClick={() => setOpen(o => !o)}
        className="flex items-center gap-2 text-sm text-zinc-400 hover:text-zinc-100 transition-colors self-start"
      >
        <span>{open ? '▾' : '▸'}</span>
        <span>History ({history.length})</span>
      </button>

      {open && (
        <div className="flex flex-col gap-1 rounded-xl border border-zinc-700 bg-zinc-800 p-2 max-h-64 overflow-y-auto">
          {history.map(entry => (
            <button
              key={entry.id}
              onClick={() => onSelect(entry)}
              className="flex flex-col gap-0.5 rounded-lg px-3 py-2 text-left hover:bg-zinc-700 transition-colors"
            >
              <span className="text-sm text-zinc-200 truncate">{entry.prompt}</span>
              <span className="text-[10px] text-zinc-500">
                {new Date(entry.timestamp).toLocaleString()} · {entry.models.length} models
              </span>
            </button>
          ))}
        </div>
      )}
    </div>
  )
}

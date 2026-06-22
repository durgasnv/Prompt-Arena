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
  try { return JSON.parse(localStorage.getItem(STORAGE_KEY) ?? '[]') } catch { return [] }
}

export function saveToHistory(entry: Omit<HistoryEntry, 'id' | 'timestamp'>) {
  const history = loadHistory()
  const next: HistoryEntry = { ...entry, id: crypto.randomUUID(), timestamp: Date.now() }
  localStorage.setItem(STORAGE_KEY, JSON.stringify([next, ...history].slice(0, MAX_ENTRIES)))
  return next
}

interface Props { onSelect: (entry: HistoryEntry) => void; refreshKey: number }

export default function HistoryPanel({ onSelect, refreshKey }: Props) {
  const [history, setHistory] = useState<HistoryEntry[]>([])
  const [open, setOpen] = useState(false)

  useEffect(() => { setHistory(loadHistory()) }, [refreshKey])

  if (history.length === 0) return null

  return (
    <div className="flex flex-col gap-2">
      <button
        onClick={() => setOpen(o => !o)}
        className="flex items-center gap-2.5 self-start group"
      >
        <span className="text-zinc-700 text-sm group-hover:text-zinc-500 transition-colors">
          {open ? '▾' : '▸'}
        </span>
        <span
          className="text-sm font-medium text-zinc-600 group-hover:text-zinc-400 transition-colors"
          style={{ fontFamily: 'var(--font-manrope)' }}
        >
          History
        </span>
        <span
          className="rounded-full px-2 py-0.5 text-[10px] font-bold"
          style={{
            background: 'rgba(99,102,241,0.12)',
            color: '#6366f1',
            fontFamily: 'var(--font-jetbrains-mono)',
          }}
        >
          {history.length}
        </span>
      </button>

      {open && (
        <div
          className="flex flex-col gap-0.5 rounded-2xl border p-2 max-h-64 overflow-y-auto"
          style={{ background: '#141417', borderColor: 'rgba(39,39,42,0.8)' }}
        >
          {history.map(entry => (
            <button
              key={entry.id}
              onClick={() => onSelect(entry)}
              className="flex flex-col gap-0.5 rounded-xl px-3.5 py-2.5 text-left transition-colors hover:bg-zinc-800/60"
            >
              <span
                className="text-sm text-zinc-300 truncate"
                style={{ fontFamily: 'var(--font-manrope)' }}
              >
                {entry.prompt}
              </span>
              <span
                className="text-[10px] text-zinc-700"
                style={{ fontFamily: 'var(--font-jetbrains-mono)' }}
              >
                {new Date(entry.timestamp).toLocaleString()} · {entry.models.length} models
              </span>
            </button>
          ))}
        </div>
      )}
    </div>
  )
}

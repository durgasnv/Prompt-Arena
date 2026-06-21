# Task 15 — HistoryPanel (localStorage)

## What this task covers
Saving each run to localStorage and showing a collapsible list of past prompts the user can click to reload.

---

## Why localStorage?
localStorage is a browser API that stores key-value pairs permanently (survives page refresh). It's the right tool for "remember my past runs" without needing a database or user accounts.

Limitations:
- Only available in the browser (not on the server) — that's why we use it inside `useEffect`
- Max ~5MB — fine for storing text responses
- Cleared if the user clears browser data

---

## Data shape

```ts
interface HistoryEntry {
  id: string          // crypto.randomUUID()
  prompt: string
  models: string[]
  results: ModelResult[]
  timestamp: number   // Date.now()
}
```

Stored as a JSON array under the key `promptarena_history`. Capped at 20 entries — oldest are dropped automatically.

---

## The refreshKey pattern

The HistoryPanel reads localStorage inside `useEffect`. But `useEffect` only re-runs when its dependencies change. After a new run, `page.tsx` increments `historyKey` which is passed as a prop — this triggers the effect and re-reads the updated history.

```tsx
// page.tsx
setHistoryKey(k => k + 1)  // triggers HistoryPanel to re-read localStorage

// HistoryPanel.tsx
useEffect(() => {
  setHistory(loadHistory())
}, [refreshKey])  // re-runs when refreshKey changes
```

---

## Selecting a past run
Clicking a history entry calls `onSelect(entry)` which sets `results` in the page — the ResultsGrid re-renders with the stored data instantly, no network request needed.

---

## Files changed
- `frontend/components/HistoryPanel.tsx` — new
- `frontend/app/page.tsx` — added save-to-history after each run, history select handler

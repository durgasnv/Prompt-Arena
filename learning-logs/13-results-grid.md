# Task 13 — ResultsGrid, LatencyChart, CostChart

## What this task covers
Laying out all model cards in a responsive grid, and rendering latency + cost bar charts below them.

---

## ResultsGrid

Receives the full `results` array and:
1. Finds the winner — the successful model with the lowest `latency_ms`
2. Renders a responsive grid of `ModelCard` components
3. Renders `LatencyChart` and `CostChart` side-by-side below

```tsx
function findWinner(results: ModelResult[]): string | null {
  const successful = results.filter(r => r.error === null && r.latency_ms != null)
  return successful.reduce((fastest, r) =>
    r.latency_ms! < fastest.latency_ms! ? r : fastest
  ).model
}
```

The `!` after `latency_ms` is a TypeScript non-null assertion — we've already filtered out nulls, so we're telling the compiler "trust me, this isn't null here."

---

## Recharts basics

```tsx
<ResponsiveContainer width="100%" height={200}>
  <BarChart data={data}>
    <XAxis dataKey="name" />
    <YAxis />
    <Tooltip />
    <Bar dataKey="latency">
      <Cell fill="#6366f1" />  {/* one Cell per bar for custom colors */}
    </Bar>
  </BarChart>
</ResponsiveContainer>
```

- `ResponsiveContainer` makes the chart resize to its parent width automatically.
- `Cell` lets you set a different fill per bar — we highlight the fastest (indigo) and most expensive (red).

---

## Grid layout

```tsx
<div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
```

- 1 column on mobile, 2 on tablet, 3 on desktop.
- Tailwind's responsive prefixes (`sm:`, `lg:`) replace media queries.

---

## Files changed
- `frontend/components/ResultsGrid.tsx` — new
- `frontend/components/LatencyChart.tsx` — new
- `frontend/components/CostChart.tsx` — new
- `frontend/app/page.tsx` — replaced raw JSON with `<ResultsGrid />`

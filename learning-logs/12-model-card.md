# Task 12 — ModelCard Component

## What this task covers
A card that displays one model's result: response text, latency, token counts, cost, and error state.

---

## Component design

```tsx
interface Props {
  result: ModelResult   // the data from /evaluate
  isWinner: boolean     // true for the fastest successful model
}
```

The card is purely presentational — it receives data and renders it. No state, no fetching.

---

## Three visual states

1. **Success** — response text + stats footer (tokens, cost)
2. **Error** — red border, error message instead of response
3. **Winner** — indigo border + WinnerBadge positioned at the top-left corner

The border color communicates status at a glance without reading any text.

---

## The Stat sub-component

```tsx
function Stat({ label, value }: { label: string; value: string | number }) { ... }
```

A small private component defined in the same file — it's only used by ModelCard so there's no reason to put it in its own file. Three instances: In tokens, Out tokens, Cost.

---

## WinnerBadge

A small pill ("Fastest") that sits above the card border using `absolute` + negative `top` offset. It's in its own file because it'll also be usable in the ResultsGrid header area.

---

## Files created
- `frontend/components/ModelCard.tsx`
- `frontend/components/WinnerBadge.tsx`

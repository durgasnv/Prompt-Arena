# Task 17 — Error Handling (Timeout, Rate Limit, Auth Fail)

## What this task covers
Making failures informative and safe — each model can fail independently without breaking the others, and the UI shows skeletons while loading.

---

## Backend: per-model timeout

```python
result = await asyncio.wait_for(runner(req.prompt), timeout=30)
```

`asyncio.wait_for()` cancels the coroutine if it takes longer than 30 seconds and raises `asyncio.TimeoutError`. We catch it and return a clean error dict instead of crashing the whole request.

Without this, one slow model could hold up the response indefinitely.

---

## Backend: friendly error messages

Raw SDK errors contain stack traces and internal codes — not useful to show users. We map common patterns to human-readable messages:

| Pattern in error | Friendly message |
|-----------------|-----------------|
| `429` / `rate` | Rate limit hit — try again in a moment |
| `401` / `403` / `auth` / `key` | Authentication failed — check your API key |
| `insufficient` / `balance` | Insufficient API credits |
| anything else | raw message |

---

## Frontend: loading skeletons

`SkeletonCard` renders animated placeholder boxes (Tailwind's `animate-pulse`) while the request is in flight. This replaces a blank screen with something that shows progress.

`ResultsGrid` now accepts `isLoading` — when true it renders N skeleton cards instead of real cards.

```tsx
if (isLoading) {
  return (
    <div className="grid ...">
      {Array.from({ length: modelCount }).map((_, i) => <SkeletonCard key={i} />)}
    </div>
  )
}
```

---

## Files changed
- `backend/main.py` — `asyncio.wait_for()` timeout + friendly error mapping
- `frontend/components/SkeletonCard.tsx` — new animated placeholder card
- `frontend/components/ResultsGrid.tsx` — accepts `isLoading`, shows skeletons
- `frontend/app/page.tsx` — passes `isLoading` to ResultsGrid

# Task 16 — Connect Frontend to Backend (End-to-End)

## What this task covers
Wiring the Next.js frontend to the FastAPI backend so a prompt submitted in the browser reaches all 5 models and results render in the UI.

---

## How it works

```
Browser → POST /evaluate → FastAPI → asyncio.gather() → 5 models in parallel → JSON response → ResultsGrid
```

1. User types a prompt and clicks Run
2. `page.tsx` calls `fetch(BACKEND + '/evaluate', { method: 'POST', body: ... })`
3. FastAPI receives the request, fans out to all selected models in parallel
4. Results return as `{ results: [...] }`
5. `setResults(data.results)` triggers a re-render — cards and charts appear

---

## Environment variable

```
NEXT_PUBLIC_BACKEND_URL=http://localhost:8000   # .env.local (dev)
```

`NEXT_PUBLIC_` prefix makes the variable available in the browser (not just server-side). When deployed, this gets changed to the Render URL.

---

## CORS

The browser blocks cross-origin requests by default. The backend already has CORS configured:

```python
app.add_middleware(
  CORSMiddleware,
  allow_origins=["http://localhost:3000", "https://*.vercel.app"],
  ...
)
```

This is why the frontend at `:3000` can talk to the backend at `:8000`.

---

## What was already in place
- `POST /evaluate` endpoint — task 02
- `asyncio.gather()` parallelism — task 02
- All 5 model integrations — tasks 03–07
- `fetch` call in `page.tsx` — task 11
- `ResultsGrid` rendering results — task 13

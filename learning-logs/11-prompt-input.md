# Task 11 — PromptInput Component

## What this task covers
Building the form that takes the user's prompt, lets them pick which models to run, and submits to the backend.

---

## Why 'use client'?
Next.js App Router components are Server Components by default — they render on the server and send HTML to the browser. Server Components cannot use `useState`, `useEffect`, or event handlers.

`PromptInput` needs `useState` (to track the prompt text and checkbox state) and `onSubmit` (an event handler), so it must be a Client Component. Adding `'use client'` at the top of the file tells Next.js to render it in the browser.

---

## Component design

```tsx
interface Props {
  onSubmit: (prompt: string, models: string[]) => void
  isLoading: boolean
}
```

The component is "controlled" — it doesn't own the results, just collects input and calls `onSubmit`. The parent (`page.tsx`) owns the fetch logic and results state. This separation keeps each piece simple.

---

## Checkbox state

```tsx
const [selected, setSelected] = useState<string[]>(MODELS.map(m => m.id))
```

All 5 models start checked. Toggling adds/removes the model ID from the array.

---

## Disabling the button

The submit button is disabled when:
- The prompt is empty
- No models are selected
- A request is already in flight (`isLoading`)

This prevents duplicate requests and gives the user clear feedback.

---

## page.tsx — what changed
- Replaced the default Next.js placeholder with the real app shell
- Added `handleSubmit` — calls `POST /evaluate`, stores results in state
- `NEXT_PUBLIC_BACKEND_URL` env var lets us switch from localhost to the deployed backend without touching code
- Results are shown as raw JSON for now — the ModelCard and ResultsGrid components (tasks 12–13) will replace that

---

## Files changed
- `frontend/components/PromptInput.tsx` — new component
- `frontend/app/page.tsx` — replaced placeholder, wired up fetch
- `frontend/app/layout.tsx` — updated title/description
- `frontend/.env.local` — backend URL for local dev

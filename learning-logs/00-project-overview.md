# PromptArena — Project Overview & Task Tracker

**Tagline:** Run once. Compare everything.  
**What it is:** A web dashboard that fires one prompt to 5 LLMs simultaneously and shows responses, latency, cost, and token counts side-by-side. 

---

## Task List

| # | Task | Status |
|---|------|--------|
| 01 | Project structure setup (folders, git, env files) | pending |
| 02 | FastAPI backend scaffold + /evaluate endpoint | pending |
| 03 | Integrate Gemma 2 9B via Groq API | pending |
| 04 | Integrate Gemini (Google AI Studio) API | pending |
| 05 | Integrate Llama via Groq API | pending |
| 06 | Integrate Cohere (Command R) API | pending |
| 07 | Integrate Mistral API | pending |
| 08 | Parallel execution with asyncio.gather() | pending |
| 09 | Cost & token estimation logic | pending |
| 10 | Next.js frontend scaffold | pending |
| 11 | PromptInput component | pending |
| 12 | ModelCard component | pending |
| 13 | ResultsGrid component | pending |
| 14 | LatencyChart + CostChart (Recharts) | pending |
| 15 | HistoryPanel (localStorage) + WinnerBadge | pending |
| 16 | Connect frontend to backend (end-to-end) | pending |
| 17 | Error handling (timeout, rate limit, auth fail) | pending |
| 18 | Export to JSON/CSV | pending |
| 19 | Deploy backend to Render | pending |
| 20 | Deploy frontend to Vercel | pending |

---

## Models

| Model | Provider | Free Tier |
|-------|----------|-----------|
| Gemma 2 9B | Groq | Yes |
| Gemini 1.5 Flash | Google AI Studio | Yes |
| Llama 3 70B | Groq | Yes |
| Command R | Cohere | Yes |
| Mistral 7B | Mistral La Plateforme | Yes |

---

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Frontend | React + Next.js (App Router) |
| Styling | Tailwind CSS |
| Charts | Recharts |
| Backend | Python FastAPI |
| Deployment | Vercel (frontend) + Render (backend) |

---

## API Contract

```
POST /evaluate
Body:    { "prompt": "string", "models": ["claude", "gemini", ...] }
Response: {
  "results": [
    {
      "model": "claude",
      "response": "...",
      "latency_ms": 843,
      "input_tokens": 12,
      "output_tokens": 97,
      "cost_usd": 0.000023,
      "error": null
    }
  ]
}
```

---

## Folder Structure (target)

```
Prompt-Arena/
├── backend/
│   ├── main.py              # FastAPI app entry point
│   ├── models/              # One file per LLM integration
│   │   ├── claude.py
│   │   ├── gemini.py
│   │   ├── groq_llama.py
│   │   ├── cohere.py
│   │   └── mistral.py
│   ├── pricing.py           # Static token pricing config
│   ├── requirements.txt
│   └── .env                 # API keys (never committed)
├── frontend/
│   ├── app/
│   │   └── page.tsx         # Main page
│   ├── components/
│   │   ├── PromptInput.tsx
│   │   ├── ModelCard.tsx
│   │   ├── ResultsGrid.tsx
│   │   ├── LatencyChart.tsx
│   │   ├── CostChart.tsx
│   │   ├── HistoryPanel.tsx
│   │   └── WinnerBadge.tsx
│   ├── package.json
│   └── .env.local           # BACKEND_URL (never committed)
└── learning-logs/           # This folder — process docs per task
```

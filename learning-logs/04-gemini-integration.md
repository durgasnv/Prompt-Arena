# Task 04 — Integrate Gemini (Google AI Studio) API

## What this task covers
Replacing the `call_gemini` stub with a real async call to Gemini 1.5 Flash via the `google-generativeai` Python SDK.

---

## Why Gemini 1.5 Flash?
Google AI Studio's free tier supports Gemini 1.5 Flash — it's fast, cheap, and doesn't require a credit card. Get a free API key at https://aistudio.google.com/app/apikey.

---

## How the SDK works

```python
import google.generativeai as genai

genai.configure(api_key="...")          # set the key once globally
model = genai.GenerativeModel("gemini-1.5-flash")
response = await model.generate_content_async(prompt)
```

- `genai.configure()` sets the API key globally for all calls in the process.
- `GenerativeModel` is created once at module load and reused.
- `generate_content_async()` is the async version — required here so `asyncio.gather()` can run all models in parallel without blocking.

---

## Reading the response

```python
response.text                                  # the response string
response.usage_metadata.prompt_token_count     # input tokens
response.usage_metadata.candidates_token_count # output tokens
```

Unlike Anthropic's SDK (which uses `message.content[0].text`), Google puts the text directly on `response.text`.

---

## Token counting and cost

`pricing.py` has Gemini 1.5 Flash rates:
```
input:  $0.075 / 1M tokens
output: $0.30  / 1M tokens
```
These are well below what you'd ever hit on the free tier.

---

## What changed

- `backend/models/gemini.py` — replaced stub with real SDK call

---

## How to get a free API key

1. Go to https://aistudio.google.com/app/apikey
2. Sign in with a Google account
3. Click "Create API key"
4. Copy the key into `backend/.env` as `GEMINI_API_KEY=your_key_here`

---

## How to test it locally

```bash
cd backend
uvicorn main:app --reload --port 8000

curl -X POST http://localhost:8000/evaluate \
  -H "Content-Type: application/json" \
  -d '{"prompt": "Say hello in one sentence.", "models": ["gemini"]}'
```

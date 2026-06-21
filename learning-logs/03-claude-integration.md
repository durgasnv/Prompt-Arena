# Task 03 — Integrate Claude (Anthropic) API

## What this task covers
Replacing the `call_claude` stub with a real async call to the Anthropic Messages API, returning response text, token counts, and cost.

---

## The Anthropic Python SDK

The SDK ships two clients: `Anthropic` (sync) and `AsyncAnthropic` (async).
Because the backend uses `asyncio.gather()` to run models in parallel, we must use the async client — a sync call inside an async function would block the event loop and cancel the parallelism benefit.

```python
import anthropic
client = anthropic.AsyncAnthropic(api_key="...")
```

The client is created once at module load and reused across requests (connection pooling).

---

## The Messages API

```python
message = await client.messages.create(
    model="claude-haiku-4-5-20251001",
    max_tokens=1024,
    messages=[{"role": "user", "content": prompt}],
)
```

- `model` — which Claude model to use. Haiku is the cheapest/fastest.
- `max_tokens` — hard cap on output length. The API won't return more than this.
- `messages` — a list of turns. For a single-turn prompt, one user message is enough.

---

## What the response looks like

```python
message.content[0].text   # the response string
message.usage.input_tokens
message.usage.output_tokens
```

`content` is a list because Claude can return multiple content blocks (text + tool calls). For plain text prompts, `content[0].text` is always the response.

---

## Token counting and cost

`pricing.py` already has the per-token rates for Claude Haiku:

```
input:  $0.25 / 1M tokens
output: $1.25 / 1M tokens
```

`estimate_cost("claude", input_tokens, output_tokens)` multiplies and sums these.

---

## What changed

- `backend/models/claude.py` — replaced `NotImplementedError` stub with real SDK call
- No changes to `main.py` or `pricing.py` — the interface was already wired up

---

## How to test it locally

```bash
# 1. Make sure ANTHROPIC_API_KEY is set in backend/.env
# 2. Start the server
cd backend
uvicorn main:app --reload --port 8000

# 3. Send a test request
curl -X POST http://localhost:8000/evaluate \
  -H "Content-Type: application/json" \
  -d '{"prompt": "Say hello in one sentence.", "models": ["claude"]}'
```

Expected response shape:
```json
{
  "results": [{
    "model": "claude",
    "response": "Hello! ...",
    "latency_ms": 843,
    "input_tokens": 12,
    "output_tokens": 18,
    "cost_usd": 0.0000255,
    "error": null
  }]
}
```

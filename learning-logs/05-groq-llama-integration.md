# Task 05 — Integrate Llama via Groq API

## What this task covers
Replacing the `call_groq` stub with a real async call to Llama 3 70B hosted on Groq.

---

## What is Groq?
Groq is an inference provider — they don't train models, they host open-source models (like Meta's Llama) and serve them extremely fast using custom hardware called LPUs (Language Processing Units). You get access to Llama 3 70B for free with rate limits.

Get a free API key at: https://console.groq.com

---

## How the SDK works

The Groq SDK uses the same interface as OpenAI's SDK — same method names, same field names. This is intentional: Groq designed their API to be a drop-in replacement.

```python
from groq import AsyncGroq

client = AsyncGroq(api_key="...")
completion = await client.chat.completions.create(
    model="llama3-70b-8192",
    messages=[{"role": "user", "content": prompt}],
    max_tokens=1024,
)
```

- `llama3-70b-8192` — Llama 3 70B with an 8192-token context window
- `chat.completions.create` — same path as OpenAI's API

---

## Reading the response

```python
completion.choices[0].message.content   # the response text
completion.usage.prompt_tokens          # input tokens
completion.usage.completion_tokens      # output tokens
```

`choices` is a list because the API can return multiple completion candidates (we always request one).

---

## What changed

- `backend/models/groq_llama.py` — replaced stub with real SDK call

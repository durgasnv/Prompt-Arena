# Task 07 — Integrate Mistral API

## What this task covers
Replacing the `call_mistral` stub with a real async call to Mistral Small via Mistral's Python SDK.

---

## What is Mistral?
Mistral AI is a French AI company that builds efficient open-weight models. Mistral Small is fast and cheap, and they offer a free trial API key.

Get a free API key at: https://console.mistral.ai/api-keys

---

## How the SDK works

```python
from mistralai import Mistral

client = Mistral(api_key="...")
response = await client.chat.complete_async(
    model="mistral-small-latest",
    messages=[{"role": "user", "content": prompt}],
    max_tokens=1024,
)
```

Note: unlike Groq/Cohere which have a separate async client class, Mistral uses one `Mistral` client with `complete_async()` as the async method.

---

## Reading the response

```python
response.choices[0].message.content    # the response text
response.usage.prompt_tokens           # input tokens
response.usage.completion_tokens       # output tokens
```

Same shape as Groq (OpenAI-compatible format).

---

## What changed

- `backend/models/mistral.py` — replaced stub with real SDK call

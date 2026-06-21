# Task 06 — Integrate Cohere (Command R) API

## What this task covers
Replacing the `call_cohere` stub with a real async call to Command R via Cohere's Python SDK.

---

## What is Cohere?
Cohere builds enterprise LLMs. Command R is their instruction-following model — good at following multi-turn conversations and tool use. They offer a free trial API key with rate limits.

Get a free API key at: https://dashboard.cohere.com/api-keys

---

## The v2 SDK

Cohere released a v2 SDK with a cleaner API. The key difference from v1: the chat method now takes `messages` (like OpenAI/Groq) instead of `chat_history` + `message`.

```python
import cohere

client = cohere.AsyncClientV2(api_key="...")
response = await client.chat(
    model="command-r",
    messages=[{"role": "user", "content": prompt}],
    max_tokens=1024,
)
```

`AsyncClientV2` is the async version — needed so `asyncio.gather()` parallelism works.

---

## Reading the response

```python
response.message.content[0].text       # the response text
response.usage.tokens.input_tokens     # input tokens
response.usage.tokens.output_tokens    # output tokens
```

`content` is a list (can contain text + tool-call blocks), so we take index 0 for the text.

---

## What changed

- `backend/models/cohere.py` — replaced stub with real SDK call

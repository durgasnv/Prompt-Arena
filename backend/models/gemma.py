import os
import httpx
from pricing import estimate_cost

_client = httpx.AsyncClient(
    base_url="https://openrouter.ai/api/v1",
    headers={
        "Authorization": f"Bearer {os.environ.get('OPENROUTER_API_KEY')}",
        "HTTP-Referer": "http://localhost:3000",
        "X-Title": "PromptArena",
    },
    timeout=30.0,
)


async def call_gemma(prompt: str) -> dict:
    response = await _client.post("/chat/completions", json={
        "model": "google/gemma-4-31b-it:free",
        "messages": [{"role": "user", "content": prompt}],
        "max_tokens": 1024,
    })
    data = response.json()
    choice = data["choices"][0]
    input_tokens = data["usage"]["prompt_tokens"]
    output_tokens = data["usage"]["completion_tokens"]
    return {
        "response": choice["message"]["content"],
        "input_tokens": input_tokens,
        "output_tokens": output_tokens,
        "cost_usd": estimate_cost("gemma", input_tokens, output_tokens),
        "error": None,
    }

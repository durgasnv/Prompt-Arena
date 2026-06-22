import os
from groq import AsyncGroq
from pricing import estimate_cost

_client = AsyncGroq(api_key=os.environ.get("GROQ_API_KEY"))


async def call_gemma(prompt: str) -> dict:
    completion = await _client.chat.completions.create(
        model="gemma2-9b-it",
        messages=[{"role": "user", "content": prompt}],
        max_tokens=512,
    )
    choice = completion.choices[0]
    input_tokens = completion.usage.prompt_tokens
    output_tokens = completion.usage.completion_tokens
    return {
        "response": choice.message.content,
        "input_tokens": input_tokens,
        "output_tokens": output_tokens,
        "cost_usd": estimate_cost("gemma", input_tokens, output_tokens),
        "error": None,
    }

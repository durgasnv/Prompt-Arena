import os
import cohere
from pricing import estimate_cost

_client = cohere.AsyncClientV2(api_key=os.environ.get("COHERE_API_KEY"))


async def call_cohere(prompt: str) -> dict:
    response = await _client.chat(
        model="command-r-08-2024",
        messages=[{"role": "user", "content": prompt}],
        max_tokens=1024,
    )
    input_tokens = response.usage.tokens.input_tokens
    output_tokens = response.usage.tokens.output_tokens
    return {
        "response": response.message.content[0].text,
        "input_tokens": input_tokens,
        "output_tokens": output_tokens,
        "cost_usd": estimate_cost("cohere", input_tokens, output_tokens),
        "error": None,
    }

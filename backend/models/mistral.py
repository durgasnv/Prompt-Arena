import os
from mistralai.client import Mistral
from pricing import estimate_cost

_client = Mistral(api_key=os.environ.get("MISTRAL_API_KEY"))


async def call_mistral(prompt: str) -> dict:
    response = await _client.chat.complete_async(
        model="mistral-small-latest",
        messages=[{"role": "user", "content": prompt}],
        max_tokens=1024,
    )
    choice = response.choices[0]
    input_tokens = response.usage.prompt_tokens
    output_tokens = response.usage.completion_tokens
    return {
        "response": choice.message.content,
        "input_tokens": input_tokens,
        "output_tokens": output_tokens,
        "cost_usd": estimate_cost("mistral", input_tokens, output_tokens),
        "error": None,
    }

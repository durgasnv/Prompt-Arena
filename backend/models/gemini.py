import os
from google import genai
from pricing import estimate_cost

_client = genai.Client(api_key=os.environ.get("GEMINI_API_KEY"))


async def call_gemini(prompt: str) -> dict:
    response = await _client.aio.models.generate_content(
        model="gemini-2.0-flash",
        contents=prompt,
    )
    input_tokens = response.usage_metadata.prompt_token_count
    output_tokens = response.usage_metadata.candidates_token_count
    return {
        "response": response.text,
        "input_tokens": input_tokens,
        "output_tokens": output_tokens,
        "cost_usd": estimate_cost("gemini", input_tokens, output_tokens),
        "error": None,
    }

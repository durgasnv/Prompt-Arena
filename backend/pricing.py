PRICING = {
    "gemma": {"input": 0.05 / 1_000_000, "output": 0.08 / 1_000_000},
    "gemini": {"input": 0.075 / 1_000_000, "output": 0.30 / 1_000_000},
    "groq": {"input": 0.05 / 1_000_000, "output": 0.08 / 1_000_000},
    "cohere": {"input": 0.15 / 1_000_000, "output": 0.15 / 1_000_000},
    "mistral": {"input": 0.25 / 1_000_000, "output": 0.25 / 1_000_000},
}

def estimate_cost(model: str, input_tokens: int, output_tokens: int) -> float:
    p = PRICING.get(model, {"input": 0, "output": 0})
    return round(p["input"] * input_tokens + p["output"] * output_tokens, 8)

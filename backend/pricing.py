PRICING = {
    "llama4": {"input": 0.11 / 1_000_000, "output": 0.34 / 1_000_000},
    "gemma": {"input": 0.0, "output": 0.0},
    "groq": {"input": 0.05 / 1_000_000, "output": 0.08 / 1_000_000},
    "cohere": {"input": 0.15 / 1_000_000, "output": 0.15 / 1_000_000},
    "mistral": {"input": 0.25 / 1_000_000, "output": 0.25 / 1_000_000},
}

def estimate_cost(model: str, input_tokens: int, output_tokens: int) -> float:
    p = PRICING.get(model, {"input": 0, "output": 0})
    return round(p["input"] * input_tokens + p["output"] * output_tokens, 8)

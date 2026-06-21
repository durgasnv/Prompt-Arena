import asyncio
import time
from contextlib import asynccontextmanager

from dotenv import load_dotenv
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel

load_dotenv()

from models.llama4 import call_llama4
from models.gemma import call_gemma
from models.groq_llama import call_groq
from models.cohere import call_cohere
from models.mistral import call_mistral

MODEL_RUNNERS = {
    "llama4": call_llama4,
    "gemma": call_gemma,
    "groq": call_groq,
    "cohere": call_cohere,
    "mistral": call_mistral,
}


@asynccontextmanager
async def lifespan(app: FastAPI):
    yield


app = FastAPI(title="PromptArena API", lifespan=lifespan)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000"],
    allow_origin_regex=r"https://.*\.vercel\.app",
    allow_methods=["POST", "GET"],
    allow_headers=["*"],
)


class EvaluateRequest(BaseModel):
    prompt: str
    models: list[str]


@app.get("/")
async def health():
    return {"status": "ok"}


@app.post("/evaluate")
async def evaluate(req: EvaluateRequest):
    async def run_model(name: str):
        runner = MODEL_RUNNERS.get(name)
        if not runner:
            return {
                "model": name, "response": None, "latency_ms": None,
                "input_tokens": None, "output_tokens": None, "cost_usd": None,
                "error": f"Unknown model: {name}",
            }
        start = time.perf_counter()
        try:
            result = await asyncio.wait_for(runner(req.prompt), timeout=45)
            result["latency_ms"] = round((time.perf_counter() - start) * 1000)
            result["model"] = name
            return result
        except asyncio.TimeoutError:
            return {
                "model": name, "response": None, "latency_ms": 45000,
                "input_tokens": None, "output_tokens": None, "cost_usd": None,
                "error": "Request timed out after 45s",
            }
        except Exception as e:
            msg = str(e)
            if "429" in msg or "rate" in msg.lower():
                friendly = "Rate limit hit — try again in a moment"
            elif "401" in msg or "403" in msg or "auth" in msg.lower() or "key" in msg.lower():
                friendly = "Authentication failed — check your API key"
            elif "insufficient" in msg.lower() or "balance" in msg.lower():
                friendly = "Insufficient API credits"
            else:
                friendly = msg
            return {
                "model": name, "response": None,
                "latency_ms": round((time.perf_counter() - start) * 1000),
                "input_tokens": None, "output_tokens": None, "cost_usd": None,
                "error": friendly,
            }

    results = await asyncio.gather(*[run_model(m) for m in req.models])
    return {"results": list(results)}

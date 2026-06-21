import asyncio
import time
from contextlib import asynccontextmanager

from dotenv import load_dotenv
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel

load_dotenv()

from models.claude import call_claude
from models.gemini import call_gemini
from models.groq_llama import call_groq
from models.cohere import call_cohere
from models.mistral import call_mistral

MODEL_RUNNERS = {
    "claude": call_claude,
    "gemini": call_gemini,
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
    allow_origins=["http://localhost:3000", "https://*.vercel.app"],
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
                "model": name,
                "response": None,
                "latency_ms": None,
                "input_tokens": None,
                "output_tokens": None,
                "cost_usd": None,
                "error": f"Unknown model: {name}",
            }
        start = time.perf_counter()
        try:
            result = await runner(req.prompt)
            result["latency_ms"] = round((time.perf_counter() - start) * 1000)
            result["model"] = name
            return result
        except Exception as e:
            return {
                "model": name,
                "response": None,
                "latency_ms": round((time.perf_counter() - start) * 1000),
                "input_tokens": None,
                "output_tokens": None,
                "cost_usd": None,
                "error": str(e),
            }

    results = await asyncio.gather(*[run_model(m) for m in req.models])
    return {"results": list(results)}

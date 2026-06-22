import asyncio
import time
import uuid
from contextlib import asynccontextmanager

from dotenv import load_dotenv
from fastapi import FastAPI, HTTPException
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

# job_id -> {"results": [...], "done": bool}
_jobs: dict[str, dict] = {}


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


async def _run_model(name: str, prompt: str) -> dict:
    runner = MODEL_RUNNERS.get(name)
    if not runner:
        return {
            "model": name, "response": None, "latency_ms": None,
            "input_tokens": None, "output_tokens": None, "cost_usd": None,
            "error": f"Unknown model: {name}",
        }
    start = time.perf_counter()
    try:
        result = await asyncio.wait_for(runner(prompt), timeout=45)
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


async def _run_job(job_id: str, prompt: str, models: list[str]):
    async def run_and_store(name: str):
        result = await _run_model(name, prompt)
        _jobs[job_id]["results"].append(result)

    await asyncio.gather(*[run_and_store(m) for m in models])
    _jobs[job_id]["done"] = True


@app.get("/")
async def health():
    return {"status": "ok"}


@app.post("/evaluate")
async def evaluate(req: EvaluateRequest):
    job_id = str(uuid.uuid4())
    _jobs[job_id] = {"results": [], "done": False}
    asyncio.create_task(_run_job(job_id, req.prompt, req.models))
    return {"job_id": job_id}


@app.get("/evaluate/{job_id}")
async def poll(job_id: str):
    job = _jobs.get(job_id)
    if job is None:
        raise HTTPException(status_code=404, detail="Job not found")
    return {"results": job["results"], "done": job["done"]}

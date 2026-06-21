# Task 02 — FastAPI Backend Scaffold

## What this task covers
Building the FastAPI app skeleton: the `/evaluate` endpoint, CORS setup, request/response shapes, and parallel execution wiring — before any real model API is connected.

---

## What is FastAPI?
FastAPI is a Python web framework for building APIs. It is fast because it runs on `uvicorn`, an async server. You define endpoints as Python functions, and FastAPI handles routing, request parsing, and response serialization automatically.

```python
@app.post("/evaluate")
async def evaluate(req: EvaluateRequest):
    ...
```

The `async def` means this function doesn't block while waiting — it can handle multiple requests at the same time.

---

## What is Pydantic?
FastAPI uses Pydantic to define the shape of request and response data. You write a class that extends `BaseModel`, and FastAPI automatically validates incoming JSON against it.

```python
class EvaluateRequest(BaseModel):
    prompt: str
    models: list[str]
```

If someone sends a request with the wrong field types, FastAPI returns a 422 error automatically — no manual validation needed.

---

## What is CORS?
CORS (Cross-Origin Resource Sharing) is a browser security rule. When your frontend at `localhost:3000` makes a request to your backend at `localhost:8000`, the browser blocks it by default because they are on different "origins" (different ports = different origin).

The `CORSMiddleware` tells the browser "yes, this frontend is allowed to talk to this backend."

```python
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000", "https://*.vercel.app"],
    ...
)
```

---

## How asyncio.gather() works
`asyncio.gather()` takes a list of async tasks and runs them all at the same time — not one after another.

```python
results = await asyncio.gather(*[run_model(m) for m in req.models])
```

Without this, calling 5 models would take the sum of all their response times.
With `gather()`, it takes roughly as long as the slowest single model.

Example:
- Claude: 800ms
- Gemini: 600ms
- Groq: 300ms
- Without gather: 1700ms total
- With gather: ~800ms total (all run in parallel)

---

## Why stub model files?
Each model (claude.py, gemini.py, etc.) currently just raises `NotImplementedError`. This lets the backend import and start without crashing — the real API calls get added one task at a time. It's the same concept as an interface or abstract method in other languages.

---

## Files created
- `backend/main.py` — FastAPI app, CORS, `/evaluate` endpoint, parallel runner
- `backend/pricing.py` — static cost-per-token config + `estimate_cost()` helper
- `backend/models/__init__.py` — makes `models/` a Python package
- `backend/models/claude.py` — stub
- `backend/models/gemini.py` — stub
- `backend/models/groq_llama.py` — stub
- `backend/models/cohere.py` — stub
- `backend/models/mistral.py` — stub

---

## How to run the backend locally (once keys are added)
```bash
cd backend
python -m venv venv
source venv/bin/activate   # Windows: venv\Scripts\activate
pip install -r requirements.txt
uvicorn main:app --reload --port 8000
```

Visit `http://localhost:8000` — should return `{"status": "ok"}`.

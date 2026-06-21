# Task 01 — Project Structure Setup

## What this task covers
Setting up the folder layout, git hygiene, and environment file conventions before writing any real code.

---

## Why structure matters first
If you start coding before organizing folders, you end up with files scattered at the root and have to move them later — which breaks imports and git history. A clean structure up front means every future file has an obvious home.

---

## What a monorepo layout means
PromptArena has two independent programs: a Python backend and a JavaScript frontend. Keeping them in one git repo (a monorepo) means:
- One place to clone
- Shared git history
- Easier to cross-reference code

The tradeoff: you need separate dependency files (`requirements.txt` for Python, `package.json` for JS) and separate deployment configs.

---

## Environment variables — the right way
API keys must never be committed to git. The standard approach:

1. Create a `.env` file locally with your real keys.
2. Add `.env` to `.gitignore` so git ignores it forever.
3. Create a `.env.example` file with fake placeholder values — this gets committed so others know which keys are needed.

```
# .env.example
ANTHROPIC_API_KEY=your_key_here
GEMINI_API_KEY=your_key_here
GROQ_API_KEY=your_key_here
COHERE_API_KEY=your_key_here
MISTRAL_API_KEY=your_key_here
```

---

## What .gitignore does
`.gitignore` tells git to pretend certain files don't exist. Common entries for this project:
- `.env` — API keys
- `__pycache__/` — Python bytecode cache, auto-generated
- `node_modules/` — JS dependencies, can be reinstalled from package.json
- `.next/` — Next.js build output

---

## Process followed
1. Created `backend/` and `frontend/` folders
2. Added `.gitignore` covering Python, Node, and env files
3. Created `backend/.env.example` with placeholder keys
4. Created `backend/requirements.txt` with initial dependencies

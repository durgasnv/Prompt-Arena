'use client'

import ModelCard from './ModelCard'
import type { ModelResult } from '@/app/page'

const NORMAL: ModelResult = {
  model: 'groq',
  response: 'The transformer architecture uses self-attention mechanisms to weigh the relevance of each word in context. Unlike RNNs, transformers process all tokens simultaneously, enabling massive parallelism and capturing long-range dependencies with ease.',
  latency_ms: 1240,
  input_tokens: 18,
  output_tokens: 44,
  cost_usd: 0.000004,
  error: null,
}

const WINNER: ModelResult = {
  model: 'llama4',
  response: 'Transformers replaced sequential RNNs with parallel self-attention, letting every token attend to every other. This unlocked scale — models like GPT-4 and Gemini are built on this foundation, trained on trillions of tokens across diverse data.',
  latency_ms: 748,
  input_tokens: 18,
  output_tokens: 43,
  cost_usd: 0.000008,
  error: null,
}

const ERROR: ModelResult = {
  model: 'mistral',
  response: null,
  latency_ms: null,
  input_tokens: null,
  output_tokens: null,
  cost_usd: null,
  error: 'Authentication failed — check your API key',
}

export default function StatesBoard() {
  return (
    <section className="w-full flex flex-col gap-6 pt-4">
      {/* Divider */}
      <div className="flex items-center gap-3">
        <div className="h-px flex-1" style={{ background: 'rgba(39,39,42,0.6)' }} />
        <span
          className="uppercase tracking-widest"
          style={{ fontSize: '9px', color: '#3f3f46', fontFamily: 'var(--font-jetbrains-mono)' }}
        >
          Card States
        </span>
        <div className="h-px flex-1" style={{ background: 'rgba(39,39,42,0.6)' }} />
      </div>

      <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
        <ModelCard result={NORMAL} isWinner={false} />
        <ModelCard result={WINNER} isWinner />
        <ModelCard result={ERROR} isWinner={false} />
      </div>
    </section>
  )
}

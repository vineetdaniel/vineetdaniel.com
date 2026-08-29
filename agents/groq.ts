/**
 * Groq provider — OpenAI-compatible Chat Completions. Very fast, but has NO
 * web search, so it writes from the model's own knowledge (last-resort writer).
 *
 * Docs: https://console.groq.com/docs
 */

import type { ChatMessage } from './shared.ts'

const GROQ_BASE_URL = 'https://api.groq.com/openai/v1'
const MODEL = process.env.GROQ_MODEL || 'llama-3.3-70b-versatile'

/** Groq completion provider. `useSearch` is ignored (no search capability). */
export async function groqComplete(messages: ChatMessage[], _useSearch: boolean): Promise<string> {
  const apiKey = process.env.GROQ_API_KEY
  if (!apiKey) throw new Error('GROQ_API_KEY is not set')

  const res = await fetch(`${GROQ_BASE_URL}/chat/completions`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${apiKey}`,
    },
    body: JSON.stringify({ model: MODEL, messages, temperature: 0.7 }),
  })

  if (!res.ok) {
    const text = await res.text()
    throw new Error(`Groq API error ${res.status}: ${text}`)
  }

  const json = await res.json()
  const content = json?.choices?.[0]?.message?.content
  if (typeof content !== 'string' || !content.trim()) {
    throw new Error('Groq returned an empty response')
  }
  return content
}

export const groqAvailable = () => Boolean(process.env.GROQ_API_KEY)

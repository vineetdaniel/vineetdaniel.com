/**
 * Ollama Cloud provider — real web research via ollama.com's Web Search API,
 * then writing with a cloud chat model. Unlike Groq, this keeps live research.
 *
 * Docs:
 *   https://docs.ollama.com/capabilities/web-search
 *   https://docs.ollama.com/cloud
 */

import type { ChatMessage } from './shared.ts'

const OLLAMA_BASE_URL = 'https://ollama.com'
const MODEL = process.env.OLLAMA_MODEL || 'gpt-oss:120b'

interface SearchResult {
  title: string
  url: string
  content: string
}

/** Run a web search via Ollama's hosted search API. */
async function webSearch(query: string, apiKey: string, maxResults = 5): Promise<SearchResult[]> {
  const res = await fetch(`${OLLAMA_BASE_URL}/api/web_search`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${apiKey}`,
    },
    body: JSON.stringify({ query, max_results: maxResults }),
  })
  if (!res.ok) {
    const text = await res.text()
    throw new Error(`Ollama web_search error ${res.status}: ${text}`)
  }
  const json = await res.json()
  return Array.isArray(json.results) ? json.results : []
}

/** Derive a concise search query from the user's writing request. */
function deriveQuery(messages: ChatMessage[]): string {
  const lastUser = [...messages].reverse().find((m) => m.role === 'user')
  if (!lastUser) return ''
  // Prefer a quoted topic if present, else the first line.
  const quoted = lastUser.content.match(/"([^"]+)"/)
  if (quoted) return quoted[1]
  return lastUser.content.split('\n')[0].slice(0, 200)
}

/** Ollama Cloud chat completion (native /api/chat). */
async function chat(messages: ChatMessage[], apiKey: string): Promise<string> {
  const res = await fetch(`${OLLAMA_BASE_URL}/api/chat`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${apiKey}`,
    },
    body: JSON.stringify({ model: MODEL, messages, stream: false }),
  })
  if (!res.ok) {
    const text = await res.text()
    throw new Error(`Ollama chat error ${res.status}: ${text}`)
  }
  const json = await res.json()
  const content = json?.message?.content
  if (typeof content !== 'string' || !content.trim()) {
    throw new Error('Ollama returned an empty response')
  }
  return content
}

/**
 * Ollama completion provider. When `useSearch` is true, it first runs a web
 * search and injects the findings into context so the model can ground its
 * writing in current information.
 */
export async function ollamaComplete(messages: ChatMessage[], useSearch: boolean): Promise<string> {
  const apiKey = process.env.OLLAMA_API_KEY
  if (!apiKey) throw new Error('OLLAMA_API_KEY is not set')

  let augmented = messages

  if (useSearch) {
    const query = deriveQuery(messages)
    if (query) {
      try {
        const results = await webSearch(query, apiKey)
        if (results.length) {
          const research = results
            .map((r, i) => `[${i + 1}] ${r.title}\n${r.url}\n${r.content.slice(0, 800)}`)
            .join('\n\n')
          // Insert research as a system note right after the main system prompt.
          const note: ChatMessage = {
            role: 'system',
            content: `Use the following current web research to ground your writing. Cite specifics where useful, but write naturally.\n\n${research}`,
          }
          const firstUserIdx = messages.findIndex((m) => m.role === 'user')
          augmented =
            firstUserIdx === -1
              ? [...messages, note]
              : [...messages.slice(0, firstUserIdx), note, ...messages.slice(firstUserIdx)]
        }
      } catch (err) {
        // Non-fatal: if search fails, write from model knowledge.
        console.warn(`   ⚠️  Ollama web search failed, writing without it: ${(err as Error).message}`)
      }
    }
  }

  return chat(augmented, apiKey)
}

export const ollamaAvailable = () => Boolean(process.env.OLLAMA_API_KEY)

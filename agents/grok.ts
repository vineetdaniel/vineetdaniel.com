/**
 * Grok (xAI) provider — writes via the Responses API (/v1/responses) with the
 * server-side `web_search` tool for real-time research. No SDK; just fetch.
 *
 * Docs: https://docs.x.ai/developers/tools/web-search
 */

import type { ChatMessage } from './shared.ts'

const XAI_BASE_URL = 'https://api.x.ai/v1'
const MODEL = process.env.XAI_MODEL || 'grok-4-6'

/**
 * Extract assistant text from a Responses API payload. Prefers the convenience
 * `output_text`, falling back to walking the `output` array.
 */
function extractText(json: Record<string, unknown>): string {
  if (typeof json.output_text === 'string' && json.output_text.trim()) {
    return json.output_text
  }
  const output = json.output as Array<Record<string, unknown>> | undefined
  if (Array.isArray(output)) {
    const parts: string[] = []
    for (const item of output) {
      const content = item?.content as Array<Record<string, unknown>> | undefined
      if (Array.isArray(content)) {
        for (const c of content) {
          if (typeof c?.text === 'string') parts.push(c.text)
        }
      }
    }
    if (parts.join('').trim()) return parts.join('')
  }
  return ''
}

/** Grok completion provider. Uses web search when `useSearch` is true. */
export async function grokComplete(messages: ChatMessage[], useSearch: boolean): Promise<string> {
  const apiKey = process.env.XAI_API_KEY
  if (!apiKey) throw new Error('XAI_API_KEY is not set')

  const body: Record<string, unknown> = {
    model: MODEL,
    input: messages,
  }
  if (useSearch) {
    body.tools = [{ type: 'web_search' }]
  }

  const res = await fetch(`${XAI_BASE_URL}/responses`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${apiKey}`,
    },
    body: JSON.stringify(body),
  })

  if (!res.ok) {
    const text = await res.text()
    throw new Error(`Grok API error ${res.status}: ${text}`)
  }

  const json = await res.json()
  const content = extractText(json)
  if (!content.trim()) throw new Error('Grok returned an empty response')
  return content
}

export const grokAvailable = () => Boolean(process.env.XAI_API_KEY)

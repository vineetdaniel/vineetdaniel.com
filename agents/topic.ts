/**
 * Topic picker — finds a fresh, trending blog topic for the daily auto-draft.
 *
 * Fully cloud-side and stateless: it dedupes against the site's live API
 * (GET /api/posts?drafts=true) so nothing repeats, and asks Grok (with web
 * search) for current high-signal topics in Vineet's categories.
 *
 * Topic research uses whatever provider is configured for writing, preferring
 * one with live web search (Grok or Ollama Cloud). If xAI is out of credits,
 * Ollama takes over; last resort is a knowledge-only provider (Groq).
 */

import { VALID_CATEGORIES, type CompletionFn } from './shared.ts'
import { grokComplete, grokAvailable } from './grok.ts'
import { ollamaComplete, ollamaAvailable } from './ollama.ts'
import { groqComplete, groqAvailable } from './groq.ts'

export interface PickedTopic {
  topic: string
  category: string
  angle: string
}

interface TopicProvider {
  name: string
  available: () => boolean
  complete: CompletionFn
  hasSearch: boolean
}

// Same preference order as agent/writer.ts: search-capable providers first.
const TOPIC_PROVIDERS: TopicProvider[] = [
  { name: 'Grok (xAI)', available: grokAvailable, complete: grokComplete, hasSearch: true },
  { name: 'Ollama Cloud', available: ollamaAvailable, complete: ollamaComplete, hasSearch: true },
  { name: 'Groq', available: groqAvailable, complete: groqComplete, hasSearch: false },
]

interface ExistingPost {
  title: string
  slug: string
}

/** Strip markdown/code noise and keep a compact bag of significant words. */
function keywords(text: string): Set<string> {
  const stop = new Set([
    'the', 'a', 'an', 'and', 'or', 'of', 'to', 'in', 'on', 'for', 'with',
    'how', 'why', 'what', 'when', 'your', 'you', 'from', 'that', 'this',
    'are', 'is', 'as', 'at', 'by', 'it', 'its', 'be', 'we', 'our', 'their',
  ])
  return new Set(
    text
      .toLowerCase()
      .replace(/[^a-z0-9\s]/g, ' ')
      .split(/\s+/)
      .filter((w) => w.length > 2 && !stop.has(w)),
  )
}

/** Jaccard similarity over keyword bags — catches near-dupes, not just exact. */
function similarity(a: Set<string>, b: Set<string>): number {
  if (a.size === 0 || b.size === 0) return 0
  let inter = 0
  for (const w of a) if (b.has(w)) inter++
  return inter / (a.size + b.size - inter)
}

/** Read existing posts (published + drafts) through the public/authed API.
 *  Best-effort: if the site is unreachable we return nothing so Grok still
 *  picks a topic — dedupe just gets weaker for that run. */
export async function fetchExistingPosts(): Promise<ExistingPost[]> {
  const baseUrl = (process.env.SITE_API_URL || 'https://www.vineetdaniel.com').replace(/\/$/, '')
  const apiSecret = process.env.API_SECRET
  try {
    const res = await fetch(`${baseUrl}/api/posts?drafts=true&limit=50`, {
      headers: apiSecret ? { 'x-api-key': apiSecret } : {},
    })
    if (!res.ok) {
      console.warn(`   ⚠️  Could not fetch existing posts (${res.status}); dedupe limited`)
      return []
    }
    const json = (await res.json()) as { data?: ExistingPost[] }
    return json.data ?? []
  } catch (err) {
    console.warn(`   ⚠️  Existing-posts fetch failed (${(err as Error).message}); dedupe skipped`)
    return []
  }
}

/**
 * Ask the first available provider for current topics (using live web search
 * when it supports it), then pick the first one that doesn't overlap with
 * anything already on the site.
 */
export async function pickTopic(): Promise<PickedTopic & { provider: string; researched: boolean }> {
  const providers = TOPIC_PROVIDERS.filter((p) => p.available())
  if (providers.length === 0) {
    throw new Error('No providers configured. Set XAI_API_KEY or OLLAMA_API_KEY in the environment.')
  }

  const existing = await fetchExistingPosts()
  const existingKeys = existing.map((p) => keywords(`${p.title} ${p.slug.replace(/-/g, ' ')}`))

  const system = `You are the editor-in-chief for Vineet Daniel's personal tech blog. Vineet is a CTO and technology generalist who writes, in first person, for Gen Z founders, young entrepreneurs, and CxOs. Your job is to propose FRESH, CURRENT blog topics grounded in what is happening in tech right now.

Categories (each topic must fit exactly one):
${VALID_CATEGORIES.map((c) => `- ${c}`).join('\n')}

Rules:
- Topics must be timely, specific, and opinion-driven, not generic listicles.
- Each topic needs a sharp angle a hands-on operator would take, not a news summary.
- No religious or political content. No hype or clickbait.

Respond with ONLY a JSON array (no fences, no commentary) of 6 objects:
[{"topic": string, "category": string (exactly one of the categories above), "angle": string}, ...]
Order by editorial value, best first.`

  const userMsg =
    'Look at what is actually happening in tech this week (use web search if you can), then propose 6 blog topics. Return ONLY the JSON array.'

  const errors: string[] = []
  let lastRaw = ''

  for (const provider of providers) {
    let raw: string
    try {
      raw = await provider.complete(
        [
          { role: 'system', content: system },
          { role: 'user', content: userMsg },
        ],
        provider.hasSearch,
      )
    } catch (err) {
      const msg = (err as Error).message
      errors.push(`${provider.name}: ${msg}`)
      console.warn(`   ✗ ${provider.name} topic research failed — ${msg.split('\n')[0]}`)
      continue
    }
    lastRaw = raw

    let candidates: PickedTopic[] = []
    try {
      const cleaned = raw.trim().replace(/^```(?:json)?\s*/i, '').replace(/```$/i, '').trim()
      const arrMatch = cleaned.match(/\[[\s\S]*\]/)
      candidates = JSON.parse(arrMatch ? arrMatch[0] : cleaned)
    } catch {
      errors.push(`${provider.name}: unparseable suggestions`)
      console.warn(`   ✗ ${provider.name} returned unparseable topics; trying next provider`)
      continue
    }

    candidates = (candidates || []).filter(
      (c) => c && typeof c.topic === 'string' && VALID_CATEGORIES.includes(c.category),
    )

    if (candidates.length === 0) {
      errors.push(`${provider.name}: no usable suggestions`)
      continue
    }

    // Pick the first candidate that doesn't significantly overlap existing posts.
    const fallback = candidates[0]
    for (const cand of candidates) {
      const candKey = keywords(cand.topic)
      const dup = existingKeys.some((ek) => similarity(candKey, ek) >= 0.55)
      if (!dup) return { ...cand, provider: provider.name, researched: provider.hasSearch }
    }

    console.warn('   ⚠️  All suggestions overlapped existing posts; using best candidate anyway.')
    return { ...fallback, provider: provider.name, researched: provider.hasSearch }
  }

  throw new Error(`All providers failed to pick a topic:\n - ${errors.join('\n - ')}\nLast raw output:\n${lastRaw}`)
}

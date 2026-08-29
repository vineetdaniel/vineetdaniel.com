/**
 * Writer — tries providers in a fallback chain until one produces a post.
 *
 * Order:
 *   1. Grok (xAI)      — model-native web search, best research
 *   2. Ollama Cloud    — real web search + cloud model
 *   3. Groq            — fast, no search (writes from model knowledge)
 *
 * The first provider that has credentials AND succeeds wins. If a provider
 * has no key it's skipped; if it errors, we log and fall through.
 */

import { writePostWith, type DraftPost, type CompletionFn } from './shared.ts'
import { grokComplete, grokAvailable } from './grok.ts'
import { ollamaComplete, ollamaAvailable } from './ollama.ts'
import { groqComplete, groqAvailable } from './groq.ts'
import { editDraft } from './editor.ts'

interface Provider {
  name: string
  available: () => boolean
  complete: CompletionFn
  hasSearch: boolean
}

const PROVIDERS: Provider[] = [
  { name: 'Grok (xAI)', available: grokAvailable, complete: grokComplete, hasSearch: true },
  { name: 'Ollama Cloud', available: ollamaAvailable, complete: ollamaComplete, hasSearch: true },
  { name: 'Groq', available: groqAvailable, complete: groqComplete, hasSearch: false },
]

export interface WriteResult extends DraftPost {
  provider: string
  researched: boolean
}

export async function writePost(topic: string): Promise<WriteResult> {
  const configured = PROVIDERS.filter((p) => p.available())
  if (configured.length === 0) {
    throw new Error(
      'No providers configured. Set at least one of XAI_API_KEY, OLLAMA_API_KEY, or GROQ_API_KEY in .env.local',
    )
  }

  const errors: string[] = []

  for (const provider of configured) {
    try {
      console.log(`   → Trying ${provider.name}...`)
      const draft = await writePostWith(provider.complete, topic)
      // Second pass: humanize + strip em dashes, profanity, religious/political content.
      console.log('   ✎ Editing (humanize + cleanup)...')
      const edited = await editDraft(provider.complete, draft)
      return { ...edited, provider: provider.name, researched: provider.hasSearch }
    } catch (err) {
      const msg = (err as Error).message
      errors.push(`${provider.name}: ${msg}`)
      console.warn(`   ✗ ${provider.name} failed — ${msg.split('\n')[0]}`)
    }
  }

  throw new Error(`All providers failed:\n - ${errors.join('\n - ')}`)
}

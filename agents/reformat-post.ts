/**
 * One-off repair tool — reformats an existing post's Markdown.
 *
 * Some early posts were saved with their block spacing collapsed (headings,
 * paragraphs, tables and code fences run together), so they render as a wall
 * of text. This pulls a post, asks the LLM editor to restore proper Markdown
 * structure (without changing wording), runs the deterministic dash/profanity
 * safety net, and PATCHes it back.
 *
 * Usage:
 *   npm run agent:reformat -- <slug-or-id>
 */

import { readFileSync, existsSync } from 'node:fs'
import { resolve } from 'node:path'
import { stripDashes, scrubProfanity, repairMarkdown } from './editor.ts'
import { grokComplete, grokAvailable } from './grok.ts'
import { ollamaComplete, ollamaAvailable } from './ollama.ts'
import { groqComplete, groqAvailable } from './groq.ts'
import type { CompletionFn } from './shared.ts'

function loadEnvLocal() {
  for (const file of ['.env.local', '.env']) {
    const path = resolve(process.cwd(), file)
    if (!existsSync(path)) continue
    for (const line of readFileSync(path, 'utf8').split('\n')) {
      const m = line.match(/^\s*([\w.-]+)\s*=\s*(.*)\s*$/)
      if (!m) continue
      let val = m[2].trim()
      if ((val.startsWith('"') && val.endsWith('"')) || (val.startsWith("'") && val.endsWith("'"))) {
        val = val.slice(1, -1)
      }
      if (!(m[1] in process.env)) process.env[m[1]] = val
    }
  }
}

const PROVIDERS: Array<{ name: string; available: () => boolean; complete: CompletionFn }> = [
  { name: 'Grok', available: grokAvailable, complete: grokComplete },
  { name: 'Ollama', available: ollamaAvailable, complete: ollamaComplete },
  { name: 'Groq', available: groqAvailable, complete: groqComplete },
]

/** Try each configured provider in order until one succeeds. */
async function completeWithFallback(system: string, userContent: string): Promise<string> {
  const configured = PROVIDERS.filter((p) => p.available())
  if (configured.length === 0) {
    throw new Error('No provider configured (set XAI_API_KEY, OLLAMA_API_KEY, or GROQ_API_KEY).')
  }
  const errors: string[] = []
  for (const p of configured) {
    try {
      console.log(`   → Trying ${p.name}...`)
      const out = await p.complete(
        [
          { role: 'system', content: system },
          { role: 'user', content: userContent },
        ],
        false,
      )
      if (out && out.trim().length > 100) return out
      errors.push(`${p.name}: response too short`)
    } catch (err) {
      errors.push(`${p.name}: ${(err as Error).message.split('\n')[0]}`)
      console.warn(`   ✗ ${p.name} failed`)
    }
  }
  throw new Error(`All providers failed:\n - ${errors.join('\n - ')}`)
}

const REFORMAT_SYSTEM = `You are a Markdown formatter. The input is a blog post whose block spacing was lost, so headings, paragraphs, tables, lists, and code fences are run together. Restore correct Markdown structure WITHOUT changing the wording:
- Put a blank line between every block.
- Put each heading (#, ##, ###) on its own line with a blank line before and after.
- Reconstruct tables so the header row, the |---|---| separator row, and each data row are each on their own line.
- Put list items on their own lines. Ensure code fences (\`\`\`) open and close correctly on their own lines.
- Do NOT add, remove, or reword content. Do NOT use em dashes or en dashes. Return ONLY the corrected Markdown.`

async function main() {
  loadEnvLocal()
  const target = process.argv.slice(2).find((a) => !a.startsWith('--'))
  if (!target) {
    console.error('Usage: npm run agent:reformat -- <slug-or-id>')
    process.exit(1)
  }

  const base = (process.env.SITE_API_URL || 'http://localhost:3000').replace(/\/$/, '')
  const apiSecret = process.env.API_SECRET
  if (!apiSecret) throw new Error('API_SECRET is not set')

  console.log(`\n📥  Fetching "${target}" from ${base}...`)
  const getRes = await fetch(`${base}/api/posts/${target}`, { headers: { 'x-api-key': apiSecret } })
  if (!getRes.ok) throw new Error(`Fetch failed (${getRes.status}): ${await getRes.text()}`)
  const post = (await getRes.json()).data
  if (!post) throw new Error('Post not found')

  console.log(`✎  Reformatting...`)
  let reformatted = await completeWithFallback(REFORMAT_SYSTEM, post.content)

  // Safety net: enforce dash/profanity rules and normalize block spacing.
  reformatted = repairMarkdown(scrubProfanity(stripDashes(reformatted.trim())))

  console.log(`💾  Saving (${post.content.length} → ${reformatted.length} chars, ${(reformatted.match(/\n\n/g) || []).length} block breaks)...`)
  const putRes = await fetch(`${base}/api/posts/${post.slug}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json', 'x-api-key': apiSecret },
    body: JSON.stringify({ content: reformatted }),
  })
  if (!putRes.ok) throw new Error(`Save failed (${putRes.status}): ${await putRes.text()}`)

  console.log(`✅  Reformatted: ${base}/${post.slug}\n`)
}

main().catch((err) => {
  console.error('\n❌  Reformat failed:', err.message)
  process.exit(1)
})

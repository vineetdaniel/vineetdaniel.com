/**
 * CLI blog agent — researches a topic with Grok and creates a draft post.
 *
 * Usage:
 *   npm run agent:draft -- "The Generalist Advantage in an AI-first world"
 *   npm run agent:draft -- --next            # take the next topic from agents/topics.md
 *   npm run agent:draft -- --publish "..."   # research, write, and publish live
 *
 * Providers are tried in a fallback chain: Grok → Ollama Cloud → Groq.
 *
 * Requires (in .env.local) — at least one provider key:
 *   XAI_API_KEY    — xAI / Grok (console.x.ai), model-native web search
 *   OLLAMA_API_KEY — Ollama Cloud (ollama.com), web search + cloud model
 *   GROQ_API_KEY   — Groq (console.groq.com), fast, no web search
 * And for publishing:
 *   API_SECRET     — the same secret your /api/posts endpoint checks
 *   SITE_API_URL   — optional, defaults to http://localhost:3000
 */

import { readFileSync, writeFileSync, existsSync } from 'node:fs'
import { resolve } from 'node:path'
import { writePost } from './writer.ts'
import { publishDraft } from './publish.ts'

const TOPICS_FILE = resolve(process.cwd(), 'agents/topics.md')

function loadEnvLocal() {
  // Minimal .env.local loader so this runs without extra deps.
  for (const file of ['.env.local', '.env']) {
    const path = resolve(process.cwd(), file)
    if (!existsSync(path)) continue
    for (const line of readFileSync(path, 'utf8').split('\n')) {
      const m = line.match(/^\s*([\w.-]+)\s*=\s*(.*)\s*$/)
      if (!m) continue
      const key = m[1]
      let val = m[2].trim()
      if ((val.startsWith('"') && val.endsWith('"')) || (val.startsWith("'") && val.endsWith("'"))) {
        val = val.slice(1, -1)
      }
      if (!(key in process.env)) process.env[key] = val
    }
  }
}

/** Read the first unchecked topic from topics.md (a "- [ ] topic" line). */
function takeNextTopic(): { topic: string; markDone: () => void } | null {
  if (!existsSync(TOPICS_FILE)) return null
  const raw = readFileSync(TOPICS_FILE, 'utf8')
  const lines = raw.split('\n')
  const idx = lines.findIndex((l) => /^\s*-\s*\[\s*\]\s+\S/.test(l))
  if (idx === -1) return null
  const topic = lines[idx].replace(/^\s*-\s*\[\s*\]\s+/, '').trim()
  return {
    topic,
    markDone: () => {
      lines[idx] = lines[idx].replace(/\[\s*\]/, '[x]')
      writeFileSync(TOPICS_FILE, lines.join('\n'))
    },
  }
}

async function main() {
  loadEnvLocal()

  const args = process.argv.slice(2)
  const publish = args.includes('--publish')
  const useNext = args.includes('--next')
  const topicArg = args.filter((a) => !a.startsWith('--')).join(' ').trim()

  let topic = topicArg
  let markDone: (() => void) | undefined

  if (useNext || !topic) {
    const next = takeNextTopic()
    if (!next) {
      console.error('No topic given and no unchecked topics in agents/topics.md.')
      console.error('Usage: npm run agent:draft -- "Your topic here"')
      process.exit(1)
    }
    topic = next.topic
    markDone = next.markDone
  }

  console.log(`\n🔎  Researching & writing: "${topic}"`)
  console.log('   (this can take a minute)\n')

  const draft = await writePost(topic)

  console.log('\n✍️   Draft ready:')
  console.log(`   Provider: ${draft.provider}${draft.researched ? ' (with web research)' : ' (no live search)'}`)
  console.log(`   Title:    ${draft.title}`)
  console.log(`   Slug:     ${draft.slug}`)
  console.log(`   Tags:     ${draft.tags.join(', ')}`)
  console.log(`   Excerpt:  ${draft.excerpt}`)
  console.log(`   Words:    ~${draft.content.split(/\s+/).length}\n`)

  const result = await publishDraft(draft, { publish })
  markDone?.()

  if (result.published) {
    console.log(`🚀  Published live: ${result.url}`)
  } else {
    console.log(`📝  Saved as DRAFT (not public). Review it, then publish with:`)
    console.log(`    curl -X PUT "${(process.env.SITE_API_URL || 'http://localhost:3000').replace(/\/$/, '')}/api/posts/${result.slug}" \\`)
    console.log(`      -H "x-api-key: $API_SECRET" -H "Content-Type: application/json" \\`)
    console.log(`      -d '{"published": true}'`)
  }
}

main().catch((err) => {
  console.error('\n❌  Agent failed:', err.message)
  process.exit(1)
})

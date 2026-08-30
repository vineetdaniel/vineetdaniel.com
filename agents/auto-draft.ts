/**
 * Auto-draft — fully cloud-side daily draft generator.
 *
 * Picks a trending topic (agents/topic.ts, Grok web search, deduped against
 * the live site), runs the standard pipeline (research → write → editor
 * agent → publish AS DRAFT), then emails a digest via Resend.
 *
 * No local state: no topics.md, no .env.local requirement, no git commits.
 * Secrets come from real environment variables (GitHub Actions secrets in CI).
 *
 * Run manually:   npm run agent:auto
 * Locally:        npm run agent:auto:local     (loads .env.local first)
 * Dry run:        npm run agent:auto -- --dry  (topic + write + email, no draft saved)
 */

import { readFileSync, existsSync } from 'node:fs'
import { resolve } from 'node:path'
import { pickTopic } from './topic.ts'
import { writePost } from './writer.ts'
import { publishDraft } from './publish.ts'
import { sendDigest } from './notify.ts'

/** Optional local fallback: load .env.local / .env only if vars are missing.
 *  In CI every var is already injected, so this is a no-op there. */
function loadEnvLocal() {
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

function runUrl(): string | undefined {
  const server = process.env.GITHUB_SERVER_URL
  const repo = process.env.GITHUB_REPOSITORY
  const runId = process.env.GITHUB_RUN_ID
  return server && repo && runId ? `${server}/${repo}/actions/runs/${runId}` : undefined
}

async function main() {
  loadEnvLocal()

  const dryRun = process.argv.includes('--dry')

  console.log('\n🔎  Picking a trending topic (live web research)...\n')
  const picked = await pickTopic()
  console.log(`   ✓ Topic:    ${picked.topic}`)
  console.log(`   ✓ Category: ${picked.category}`)
  console.log(`   ✓ Angle:    ${picked.angle}`)
  console.log(`   ✓ Source:   ${picked.provider}${picked.researched ? ' (live web search)' : ' (no search)'}\n`)

  console.log('✍️   Researching & writing (this can take a minute)...\n')
  const draft = await writePost(picked.topic)

  const wordCount = draft.content.split(/\s+/).length

  let slug = draft.slug
  if (dryRun) {
    console.log(`\n🧪  DRY RUN — not saving to the site.`)
  } else {
    const result = await publishDraft(draft, { publish: false })
    slug = result.slug
    console.log(`\n📝  Draft saved (unpublished): ${result.url}`)
    // Make the result visible in the GitHub Actions run log/summary.
    console.log(`\n::notice title=Draft ready::${draft.title} — ${result.url}`)
  }

  console.log(`    Provider: ${draft.provider}${draft.researched ? ' (with web research)' : ''}`)
  console.log(`    Title:    ${draft.title}`)
  console.log(`    Words:    ~${wordCount}`)

  await sendDigest({
    status: 'success',
    topic: picked.topic,
    category: picked.category,
    title: draft.title,
    slug,
    excerpt: draft.excerpt,
    tags: draft.tags,
    wordCount,
    provider: draft.provider,
    researched: draft.researched,
  })
}

main().catch(async (err) => {
  const message = (err as Error).message
  console.error('\n❌  Auto-draft failed:', message)
  console.error(`::error title=Auto-draft failed::${message.split('\n')[0]}`)
  try {
    await sendDigest({ status: 'failure', error: message, runUrl: runUrl() })
  } catch {
    // Notification failed too; nothing more we can do.
  }
  process.exit(1)
})

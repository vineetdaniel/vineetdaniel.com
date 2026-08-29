/**
 * One-off audit — scans all posts in the DB for content that violates the
 * house style: em/en dashes, profanity/slang, and religious/political terms.
 * Read-only; reports findings without modifying anything.
 *
 *   npm run agent:audit
 */

import { PrismaClient } from '@prisma/client'

const db = new PrismaClient()

const DASHES = /[\u2010\u2011\u2012\u2013\u2014\u2015\u2212\uFE58\uFE63\uFF0D]/g

const PROFANITY = [
  'fuck', 'shit', 'bitch', 'asshole', 'bastard', 'dick', 'piss', 'cunt',
  'motherfucker', 'bullshit', 'damn', 'goddamn', 'crap', 'slut', 'whore',
]

// Religious / political signal terms (broad, for review — not auto-editing).
const REL_POL = [
  'god', 'jesus', 'christ', 'allah', 'bible', 'quran', 'church', 'mosque',
  'temple', 'prayer', 'pray', 'religion', 'religious', 'faith', 'holy',
  'democrat', 'republican', 'election', 'politician', 'political', 'politics',
  'liberal', 'conservative', 'trump', 'biden', 'congress', 'senate', 'vote',
]

function countMatches(text: string, words: string[]): { term: string; count: number }[] {
  const found: { term: string; count: number }[] = []
  for (const w of words) {
    const re = new RegExp(`\\b${w}\\b`, 'gi')
    const m = text.match(re)
    if (m) found.push({ term: w, count: m.length })
  }
  return found
}

function snippet(text: string, re: RegExp): string {
  const m = re.exec(text)
  if (!m) return ''
  const i = Math.max(0, m.index - 30)
  return '…' + text.slice(i, m.index + 30).replace(/\n/g, ' ') + '…'
}

async function main() {
  const posts = await db.post.findMany({
    orderBy: { createdAt: 'desc' },
    select: { title: true, slug: true, published: true, content: true },
  })

  console.log(`\nAuditing ${posts.length} post(s)\n${'='.repeat(50)}`)

  let flaggedCount = 0

  for (const p of posts) {
    const text = `${p.title}\n${p.content}`
    const issues: string[] = []

    const dashMatches = text.match(DASHES)
    if (dashMatches) {
      issues.push(`  • ${dashMatches.length} em/en dash(es)  e.g. ${snippet(text, new RegExp(DASHES.source))}`)
    }

    const prof = countMatches(text, PROFANITY)
    if (prof.length) {
      issues.push(`  • profanity/slang: ${prof.map((x) => `${x.term}(${x.count})`).join(', ')}`)
    }

    const rp = countMatches(text, REL_POL)
    if (rp.length) {
      issues.push(`  • religious/political terms (review): ${rp.map((x) => `${x.term}(${x.count})`).join(', ')}`)
    }

    if (issues.length) {
      flaggedCount++
      console.log(`\n${p.published ? '[live] ' : '[draft]'} ${p.slug}`)
      console.log(`  "${p.title}"`)
      issues.forEach((i) => console.log(i))
    }
  }

  console.log(`\n${'='.repeat(50)}`)
  console.log(`${flaggedCount} of ${posts.length} post(s) flagged.\n`)

  await db.$disconnect()
}

main().catch(async (e) => {
  console.error('Audit failed:', e.message)
  await db.$disconnect()
  process.exit(1)
})

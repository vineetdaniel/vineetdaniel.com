/**
 * Editor / humanizer agent — runs right after a draft is written.
 *
 * It does two things:
 *   1. An LLM "humanize + sanitize" pass (uses the same provider fallback):
 *      - make the prose sound naturally human, not AI-generated
 *      - remove profanity
 *      - remove religious or political content
 *      - avoid em dashes
 *   2. A deterministic cleanup that GUARANTEES no em/en dashes remain,
 *      regardless of what the model returns.
 *
 * The deterministic pass is the safety net: models don't always follow
 * "no em dashes," so we enforce it in code.
 */

import type { CompletionFn, DraftPost } from './shared.ts'

const EDITOR_SYSTEM = `You are a meticulous human editor polishing a blog post for a CTO's personal site. Rewrite the given Markdown so it reads as authentically human-written, keeping the author's first-person voice, meaning, structure, and Markdown formatting intact.

Apply these rules strictly:
1. HUMANIZE: vary sentence rhythm, cut filler and AI-tells (e.g. "in today's fast-paced world", "it's worth noting", "delve", "tapestry", "moreover"), prefer concrete language. Do not add new claims.
2. NO EM DASHES OR EN DASHES: never use — or –. Rewrite with commas, periods, parentheses, or "to" for ranges.
3. NO PROFANITY: remove or replace any profanity with clean wording.
4. NO RELIGIOUS OR POLITICAL CONTENT: remove references to religion, religious belief, political parties, politicians, elections, or partisan/ideological positions. Rework the surrounding sentence so it still flows and keeps the technical point.
5. PRESERVE MARKDOWN STRUCTURE: keep a blank line between every block (headings, paragraphs, lists, tables, code fences, and thematic breaks). Do not merge blocks onto one line. Close every code fence you open.
6. Keep it roughly the same length. Return ONLY the cleaned Markdown body, with no preamble or commentary.`

// All unicode dash variants we want to normalize away: em, en, figure,
// horizontal bar, non-breaking hyphen, minus sign, small/fullwidth dashes.
const DASHES = /[\u2010\u2011\u2012\u2013\u2014\u2015\u2212\uFE58\uFE63\uFF0D]/

// Deterministic profanity backstop. The LLM pass does the nuanced work; this
// catches obvious slips (with common leet/spacing variants) and replaces them.
const PROFANITY = [
  'fuck', 'fucking', 'fucked', 'motherfucker', 'shit', 'bullshit', 'shitty',
  'bitch', 'asshole', 'ass', 'bastard', 'dick', 'piss', 'pissed', 'cunt',
  'damn', 'goddamn', 'crap', 'slut', 'whore', 'douche', 'douchebag',
  'wtf', 'stfu', 'bollocks', 'wanker', 'prick', 'twat',
]

/**
 * Redact obvious profanity while preserving surrounding text. Matches whole
 * words case-insensitively, including simple f*ck / f u c k style evasions.
 */
export function scrubProfanity(text: string): string {
  let out = text
  for (const word of PROFANITY) {
    // Allow up to two non-word separators (*, ., spaces) BETWEEN letters only,
    // so we don't consume the space after the word.
    const pattern = word.split('').join('[\\W_]{0,2}')
    out = out.replace(new RegExp(`\\b${pattern}\\b`, 'gi'), (m) => {
      // Keep first letter, mask the rest with asterisks of matched length.
      const letters = m.replace(/[\W_]/g, '')
      return letters[0] + '*'.repeat(Math.max(1, letters.length - 1))
    })
  }
  return out
}

/**
 * Normalize unicode dashes and dash-like whitespace to clean ASCII.
 * "No em dashes" in practice means none of the fancy unicode dashes survive.
 */
export function stripDashes(text: string): string {
  // Horizontal whitespace only (NOT newlines) — using \s would eat the blank
  // lines that Markdown needs between blocks.
  const H = '[^\\S\\r\\n]'
  return (
    text
      // Narrow/no-break spaces -> normal space (often paired with dashes)
      .replace(/[\u00A0\u202F\u2009]/g, ' ')
      // Non-breaking / figure hyphen inside a word (e.g. "Post‑Incident") -> plain hyphen
      .replace(/(\w)[\u2010\u2011\u2012](\w)/g, '$1-$2')
      // number–number ranges -> "number to number" (before generic replacement)
      .replace(new RegExp(`(\\d)${H}*${DASHES.source}${H}*(\\d)`, 'g'), '$1 to $2')
      // em/en/bar dash used as punctuation BETWEEN words with no spaces
      // (e.g. "tech—from", "2010—one") -> comma. These read as broken
      // hyphenated words if we just swap in a hyphen, so treat them as a
      // clause break. (Numeric ranges were already handled above.)
      .replace(/(\w)[\u2013\u2014\u2015](\w)/g, '$1, $2')
      // " — " used as a sentence break (spaces/tabs only, keep newlines) -> ", "
      .replace(new RegExp(`${H}*${DASHES.source}${H}+`, 'g'), ', ')
      // any remaining dash variant -> plain hyphen
      .replace(new RegExp(DASHES.source, 'g'), '-')
      // collapse accidental double spaces (but not newlines) from the above
      .replace(new RegExp(`${H}{2,}`, 'g'), ' ')
  )
}

/**
 * Repair Markdown block spacing. LLM output (and our own cleanup) sometimes
 * collapses the blank lines that Markdown needs to separate blocks, producing
 * a run-on wall of text. This guarantees headings, thematic breaks, tables,
 * and fenced code blocks are surrounded by blank lines.
 */
export function repairMarkdown(text: string): string {
  let out = text.replace(/\r\n/g, '\n')

  // If the whole document has no blank lines, the model returned single-spaced
  // Markdown. Insert breaks before block-level markers that appear mid-line.
  if (!out.includes('\n\n')) {
    out = out
      // Break before ATX headings that got glued to preceding text
      .replace(/([^\n])[^\S\n]*(#{1,6}\s)/g, '$1\n\n$2')
      // Break before fenced code starts/ends
      .replace(/([^\n])[^\S\n]*(```)/g, '$1\n\n$2')
      // A standalone " --- " separator (spaces on BOTH sides, so it won't
      // match table separator rows like |---|---|) becomes a thematic break.
      .replace(/[^\S\n]+---[^\S\n]+/g, '\n\n---\n\n')
      // Break before a table cell row that got glued to preceding prose.
      .replace(/([^\n|])[^\S\n]*(\|[^\n]*\|)/g, '$1\n\n$2')
      // Put each subsequent table row on its own line.
      .replace(/(\|)[^\S\n]+(\|[^\n]*\|)/g, '$1\n$2')
  }

  // Ensure a blank line BEFORE and AFTER headings.
  out = out.replace(/([^\n])\n(#{1,6}\s)/g, '$1\n\n$2')
  out = out.replace(/^(#{1,6}\s.*)\n(?!\n)/gm, '$1\n\n')

  // Ensure a blank line before a table block (line starting with | preceded by prose).
  out = out.replace(/([^\n|])\n(\|)/g, '$1\n\n$2')

  // Collapse 3+ newlines to exactly 2.
  out = out.replace(/\n{3,}/g, '\n\n')

  return out.trim()
}

/**
 * Run the editor pass over a draft. Returns a new draft with cleaned content,
 * title, and excerpt. Falls back to deterministic-only cleaning if the LLM
 * pass fails, so drafting never breaks because of the editor.
 */
export async function editDraft(complete: CompletionFn, draft: DraftPost): Promise<DraftPost> {
  let content = draft.content

  try {
    const cleaned = await complete(
      [
        { role: 'system', content: EDITOR_SYSTEM },
        { role: 'user', content: draft.content },
      ],
      false,
    )
    if (cleaned && cleaned.trim().length > 200) {
      content = cleaned.trim()
    }
  } catch (err) {
    console.warn(`   ⚠️  Editor LLM pass failed, applying rules only: ${(err as Error).message}`)
  }

  // Deterministic safety net — guarantees the dash rule holds and scrubs any
  // obvious profanity the LLM pass may have missed. Title/excerpt are plain
  // text; content is Markdown and additionally gets block-spacing repaired so
  // it never renders as a run-on wall of text.
  const cleanText = (s: string) => scrubProfanity(stripDashes(s)).replace(/\n+/g, ' ').trim()
  return {
    ...draft,
    title: cleanText(draft.title),
    excerpt: cleanText(draft.excerpt),
    content: repairMarkdown(scrubProfanity(stripDashes(content))),
  }
}

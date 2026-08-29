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
5. Keep it roughly the same length. Return ONLY the cleaned Markdown body, with no preamble or commentary.`

// All unicode dash variants we want to normalize away: em, en, figure,
// horizontal bar, non-breaking hyphen, minus sign, small/fullwidth dashes.
const DASHES = /[\u2010\u2011\u2012\u2013\u2014\u2015\u2212\uFE58\uFE63\uFF0D]/

/**
 * Normalize unicode dashes and dash-like whitespace to clean ASCII.
 * "No em dashes" in practice means none of the fancy unicode dashes survive.
 */
export function stripDashes(text: string): string {
  return (
    text
      // Narrow/no-break spaces -> normal space (often paired with dashes)
      .replace(/[\u00A0\u202F\u2009]/g, ' ')
      // Non-breaking / figure hyphen inside a word (e.g. "Post‑Incident") -> plain hyphen
      .replace(/(\w)[\u2010\u2011\u2012](\w)/g, '$1-$2')
      // " — " / " – " used as a sentence break -> ", "
      .replace(new RegExp(`\\s*${DASHES.source}\\s+`, 'g'), (m) => (/^\s/.test(m) ? ', ' : ', '))
      // number–number ranges -> "number to number"
      .replace(new RegExp(`(\\d)\\s*${DASHES.source}\\s*(\\d)`, 'g'), '$1 to $2')
      // any remaining dash variant -> plain hyphen
      .replace(new RegExp(DASHES.source, 'g'), '-')
      // collapse accidental double spaces from the above
      .replace(/ {2,}/g, ' ')
  )
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

  // Deterministic safety net — guarantees the dash rule holds everywhere.
  return {
    ...draft,
    title: stripDashes(draft.title),
    excerpt: stripDashes(draft.excerpt),
    content: stripDashes(content),
  }
}

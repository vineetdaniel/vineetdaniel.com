/**
 * Shared types, prompts, and the provider-agnostic post-writing pipeline.
 *
 * A "provider" is just an async function that takes chat messages and a
 * `useSearch` hint and returns the model's text. grok.ts, ollama.ts and
 * groq.ts each implement one; writer.ts wires them together with fallback.
 */

export interface DraftPost {
  title: string
  slug: string
  excerpt: string
  tags: string[]
  content: string
}

export interface ChatMessage {
  role: string
  content: string
}

/** A model provider: given messages, return the completion text. */
export type CompletionFn = (messages: ChatMessage[], useSearch: boolean) => Promise<string>

export const VALID_CATEGORIES = [
  'AI & Future',
  'Startup Scaling',
  'Cyber Security',
  'Product & Leadership',
  'Life as a Generalist',
  'Tech Trends',
]

export const SYSTEM_PROMPT = `You are the ghostwriter for Vineet Daniel — a CTO and versatile technology generalist with hands-on experience across software engineering, product management, IT infrastructure, AI, and cyber security. He is known for scaling operations, building high-performing teams, and powering up startups from early stage to growth.

Write as Vineet, in FIRST PERSON ("I", "my", "we"). Voice and tone:
- Confident, approachable, insightful, and slightly rebellious/innovative.
- Conversational with real intellectual depth. Bold and thoughtful, never corporate, never resume-speak, no humble-bragging.
- Think "Paul Graham meets a modern Gen Z founder." Show, don't tell. Ground claims in reality; avoid hype and superlatives.
- Audience: Gen Z founders, young entrepreneurs, CxOs, and recruiters who value depth and authenticity.

Content requirements:
- 1000-2000 words, readable in ~8-10 minutes.
- Clear intro, well-structured body sections with H2/H3 headings, and a conclusion.
- Use concrete examples and frameworks drawn from operating experience.
- Base any current facts, tools, versions, or trends on your knowledge (and web research if available), and be accurate.
- Format the body as clean Markdown (headings, lists, occasional blockquote or code where it genuinely helps). Do NOT include the title as an H1 — the site renders the title separately.`

/** Turn a title into a URL-safe slug. */
export function slugify(title: string): string {
  return title
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, '')
    .trim()
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
    .slice(0, 80)
}

/**
 * Research + write a post about `topic` using the given provider.
 * Runs two calls: (1) write the article body, (2) derive metadata.
 */
export async function writePostWith(complete: CompletionFn, topic: string): Promise<DraftPost> {
  // 1) Write the article body (with search if the provider supports it).
  const article = await complete(
    [
      { role: 'system', content: SYSTEM_PROMPT },
      {
        role: 'user',
        content: `Write a blog post on this topic: "${topic}".\n\nResearch anything current before writing if you can. Return ONLY the article body as Markdown — no title heading, no preamble, no commentary.`,
      },
    ],
    true,
  )

  // 2) Derive metadata (title, excerpt, tags) from the finished article.
  const metaRaw = await complete(
    [
      {
        role: 'system',
        content: `You generate publishing metadata for a blog post. Respond with ONLY a JSON object, no markdown fences, matching:
{
  "title": string (compelling, <= 70 chars, no trailing period),
  "excerpt": string (120-160 chars, first person, hooks the reader),
  "tags": string[] (2-4 tags chosen from EXACTLY these categories: ${VALID_CATEGORIES.join(', ')})
}`,
      },
      { role: 'user', content: `Here is the article:\n\n${article.slice(0, 6000)}` },
    ],
    false,
  )

  let meta: { title: string; excerpt: string; tags: string[] }
  try {
    const cleaned = metaRaw.trim().replace(/^```(?:json)?\s*/i, '').replace(/```$/i, '').trim()
    meta = JSON.parse(cleaned)
  } catch {
    throw new Error(`Could not parse metadata JSON:\n${metaRaw}`)
  }

  const tags = (meta.tags || []).filter((t) => VALID_CATEGORIES.includes(t)).slice(0, 4)

  return {
    title: meta.title.trim(),
    slug: slugify(meta.title),
    excerpt: meta.excerpt.trim(),
    tags: tags.length ? tags : ['Tech Trends'],
    content: article.trim(),
  }
}

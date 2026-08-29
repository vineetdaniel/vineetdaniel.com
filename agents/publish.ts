/**
 * Publisher — sends a draft to the site's own JSON API (POST /api/posts).
 *
 * By default posts are created UNPUBLISHED (published: false) so you can
 * review them before they go live. Pass { publish: true } to publish directly.
 */

import type { DraftPost } from './shared.ts'

export interface PublishOptions {
  publish?: boolean
}

export interface PublishResult {
  id: string
  slug: string
  published: boolean
  url: string
}

export async function publishDraft(draft: DraftPost, opts: PublishOptions = {}): Promise<PublishResult> {
  const baseUrl = (process.env.SITE_API_URL || 'http://localhost:3000').replace(/\/$/, '')
  const apiSecret = process.env.API_SECRET
  if (!apiSecret) throw new Error('API_SECRET is not set. Add it to your .env.local')

  const res = await fetch(`${baseUrl}/api/posts`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'x-api-key': apiSecret,
    },
    body: JSON.stringify({
      title: draft.title,
      slug: draft.slug,
      excerpt: draft.excerpt,
      content: draft.content,
      tags: draft.tags,
      published: Boolean(opts.publish),
    }),
  })

  if (!res.ok) {
    const text = await res.text()
    throw new Error(`Publish failed (${res.status}): ${text}`)
  }

  const json = await res.json()
  const post = json.data

  return {
    id: post.id,
    slug: post.slug,
    published: post.published,
    url: `${baseUrl}/${post.slug}`,
  }
}

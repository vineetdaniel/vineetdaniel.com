import type { MetadataRoute } from 'next'
import { db, publiclyVisible } from '@/lib/db'

// Always query at request time — new posts appear without a redeploy.
export const dynamic = 'force-dynamic'
export const revalidate = 0

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || 'https://www.vineetdaniel.com'

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  let posts: Array<{ slug: string; updatedAt: Date; publishedAt: Date | null }> = []

  try {
    posts = await db.post.findMany({
      where: publiclyVisible(),
      select: { slug: true, updatedAt: true, publishedAt: true },
      orderBy: { publishedAt: 'desc' },
    })
  } catch {
    // DB unavailable during build
  }

  return [
    {
      url: SITE_URL,
      lastModified: new Date(),
      changeFrequency: 'daily',
      priority: 1,
    },
    ...posts.map((post) => ({
      url: `${SITE_URL}/${post.slug}`,
      lastModified: post.updatedAt,
      changeFrequency: 'weekly' as const,
      priority: 0.8,
    })),
  ]
}

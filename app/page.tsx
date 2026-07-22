import type { Metadata } from 'next'
import Link from 'next/link'
import { db } from '@/lib/db'
import { formatDate } from '@/lib/utils'
import { TagCloud } from '@/components/TagCloud'

export const metadata: Metadata = {
  title: 'Vineet Daniel',
  description: 'Writing on technology, engineering, AI, and building things.',
  alternates: { canonical: process.env.NEXT_PUBLIC_SITE_URL || 'https://vineetdaniel-com.vercel.app' },
  openGraph: {
    type: 'website',
    url: process.env.NEXT_PUBLIC_SITE_URL || 'https://vineetdaniel-com.vercel.app',
    title: 'Vineet Daniel — Writing',
    description: 'Writing on technology, engineering, AI, and building things.',
    siteName: 'Vineet Daniel',
  },
  twitter: {
    card: 'summary',
    title: 'Vineet Daniel — Writing',
    description: 'Writing on technology, engineering, AI, and building things.',
  },
}

export const revalidate = 60

type SearchParams = Promise<{ tag?: string }>

export default async function Home({ searchParams }: { searchParams: SearchParams }) {
  const { tag } = await searchParams

  let posts: Array<{ title: string; slug: string; excerpt: string | null; tags: string[]; publishedAt: Date | null }> = []
  let tagCounts: Record<string, number> = {}

  try {
    const allPosts = await db.post.findMany({
      where: { published: true },
      orderBy: { publishedAt: 'desc' },
      select: { title: true, slug: true, excerpt: true, tags: true, publishedAt: true },
    })

    // Build tag counts from all posts
    tagCounts = allPosts.reduce<Record<string, number>>((acc, post) => {
      post.tags.forEach((t) => { acc[t] = (acc[t] ?? 0) + 1 })
      return acc
    }, {})

    // Filter by active tag
    posts = tag ? allPosts.filter((p) => p.tags.includes(tag)) : allPosts
  } catch {
    // DB not connected yet
  }

  return (
    <div>
      <div style={{ marginBottom: 36 }}>
        <h1 style={{ fontSize: 22, fontWeight: 700, margin: '0 0 8px', letterSpacing: '-0.02em' }}>Writing</h1>
        <p style={{ fontSize: 15, color: '#6b7280', margin: 0, lineHeight: 1.6 }}>
          Notes on engineering, product, AI, and building technology.
        </p>
      </div>

      <TagCloud tags={tagCounts} activeTag={tag} />

      {posts.length === 0 ? (
        <div style={{ padding: '48px 0', color: '#9ca3af' }}>
          {tag ? (
            <p style={{ fontSize: 14 }}>
              No posts tagged <span style={{ fontFamily: 'var(--font-mono)' }}>{tag}</span>.{' '}
              <Link href="/" style={{ color: '#2563eb' }}>Clear filter</Link>
            </p>
          ) : (
            <>
              <p style={{ fontFamily: 'var(--font-mono)', fontSize: 13 }}>// no posts yet</p>
              <p style={{ fontSize: 14, marginTop: 12 }}>
                Create the first one via{' '}
                <code style={{ background: '#f3f4f6', padding: '2px 6px', borderRadius: 4, fontSize: 13 }}>
                  POST /api/posts
                </code>
              </p>
            </>
          )}
        </div>
      ) : (
        <div>
          {tag && (
            <p style={{ fontSize: 13, color: '#9ca3af', fontFamily: 'var(--font-mono)', marginBottom: 24 }}>
              {posts.length} post{posts.length !== 1 ? 's' : ''} tagged &quot;{tag}&quot;
            </p>
          )}
          {posts.map((post) => (
            <article
              key={post.slug}
              style={{ borderBottom: '1px solid #f3f4f6', paddingBottom: 28, marginBottom: 28 }}
            >
              <div style={{ display: 'flex', alignItems: 'baseline', gap: 20, marginBottom: 8 }}>
                <time style={{ fontFamily: 'var(--font-mono)', fontSize: 12, color: '#9ca3af', flexShrink: 0, width: 90 }}>
                  {post.publishedAt ? formatDate(post.publishedAt) : '—'}
                </time>
                <Link
                  href={`/${post.slug}`}
                  style={{ fontSize: 16, fontWeight: 600, color: '#111', textDecoration: 'none', letterSpacing: '-0.01em', lineHeight: 1.4 }}
                >
                  {post.title}
                </Link>
              </div>
              {post.excerpt && (
                <p style={{ fontSize: 14, color: '#6b7280', margin: '0 0 10px 110px', lineHeight: 1.6 }}>
                  {post.excerpt}
                </p>
              )}
              {post.tags.length > 0 && (
                <div style={{ display: 'flex', gap: 6, marginLeft: 110, flexWrap: 'wrap' }}>
                  {post.tags.map((t) => (
                    <Link
                      key={t}
                      href={`/?tag=${encodeURIComponent(t)}`}
                      style={{
                        fontFamily: 'var(--font-mono)',
                        fontSize: 11,
                        color: t === tag ? '#111' : '#6b7280',
                        background: t === tag ? '#e5e7eb' : '#f3f4f6',
                        padding: '2px 8px',
                        borderRadius: 3,
                        textDecoration: 'none',
                        fontWeight: t === tag ? 600 : 400,
                      }}
                    >
                      {t}
                    </Link>
                  ))}
                </div>
              )}
            </article>
          ))}
        </div>
      )}
    </div>
  )
}

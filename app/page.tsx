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

  const isFiltered = Boolean(tag)
  const [lead, ...rest] = posts

  return (
    <div>
      {/* Hero / positioning — only on the unfiltered index */}
      {!isFiltered && (
        <section style={{ maxWidth: 720, margin: '0 0 64px' }}>
          <p className="eyebrow" style={{ maxWidth: 340 }}>Field notes on technology leadership</p>
          <h1 style={{ fontSize: 44, fontWeight: 800, margin: '0 0 18px', letterSpacing: '-0.04em', lineHeight: 1.08, color: 'var(--ink)' }}>
            Building and scaling technology, in the open.
          </h1>
          <p style={{ fontSize: 18, color: 'var(--body)', margin: 0, lineHeight: 1.6, maxWidth: 620 }}>
            I lead engineering and product as a technology generalist — spanning architecture, AI,
            cyber security, and the operational craft of scaling startups. These are my notes from
            the work: frameworks, hard lessons, and the things I&apos;m still figuring out.
          </p>
        </section>
      )}

      <TagCloud tags={tagCounts} activeTag={tag} />

      {posts.length === 0 ? (
        <div style={{ padding: '48px 0', color: 'var(--faint)' }}>
          {isFiltered ? (
            <p style={{ fontSize: 14 }}>
              No posts tagged <span style={{ fontFamily: 'var(--font-mono)' }}>{tag}</span>.{' '}
              <Link href="/" className="link-accent">Clear filter</Link>
            </p>
          ) : (
            <>
              <p style={{ fontFamily: 'var(--font-mono)', fontSize: 13 }}>// no posts yet</p>
              <p style={{ fontSize: 14, marginTop: 12 }}>
                Create the first one via{' '}
                <code style={{ background: 'var(--surface-2)', padding: '2px 6px', borderRadius: 4, fontSize: 13 }}>
                  POST /api/posts
                </code>
              </p>
            </>
          )}
        </div>
      ) : isFiltered ? (
        <>
          <p style={{ fontSize: 13, color: 'var(--faint)', fontFamily: 'var(--font-mono)', marginBottom: 28 }}>
            {posts.length} post{posts.length !== 1 ? 's' : ''} tagged &quot;{tag}&quot;
          </p>
          <div className="post-grid">
            {posts.map((post) => <PostRow key={post.slug} post={post} activeTag={tag} />)}
          </div>
        </>
      ) : (
        <>
          {/* Featured lead post */}
          <p className="eyebrow">Latest</p>
          <Link href={`/${lead.slug}`} className="featured" style={{ marginBottom: 64 }}>
            <time style={{ fontFamily: 'var(--font-mono)', fontSize: 12, color: 'var(--faint)', display: 'block', marginBottom: 14, letterSpacing: '0.03em' }}>
              {lead.publishedAt ? formatDate(lead.publishedAt) : '—'}
            </time>
            <h2 style={{ fontSize: 30, fontWeight: 800, color: 'var(--ink)', letterSpacing: '-0.03em', lineHeight: 1.18, margin: '0 0 14px' }}>
              {lead.title}
            </h2>
            {lead.excerpt && (
              <p style={{ fontSize: 17, color: 'var(--body)', margin: '0 0 18px', lineHeight: 1.6, maxWidth: 640 }}>
                {lead.excerpt}
              </p>
            )}
            <span style={{ fontSize: 14, fontWeight: 600, color: 'var(--accent)' }}>Read essay →</span>
          </Link>

          {/* Structured list */}
          {rest.length > 0 && (
            <>
              <p className="eyebrow">More writing</p>
              <div className="post-grid">
                {rest.map((post) => <PostRow key={post.slug} post={post} activeTag={tag} />)}
              </div>
            </>
          )}

          {/* Author / bio block */}
          <section style={{ marginTop: 80, paddingTop: 40, borderTop: '1px solid var(--border)', display: 'flex', gap: 20, alignItems: 'flex-start', flexWrap: 'wrap' }}>
            <div style={{ width: 56, height: 56, borderRadius: '50%', background: 'linear-gradient(135deg, var(--accent), #6d28d9)', color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 800, fontSize: 20, flexShrink: 0, letterSpacing: '-0.02em' }}>
              VD
            </div>
            <div style={{ flex: 1, minWidth: 260 }}>
              <p style={{ margin: '0 0 6px', fontWeight: 700, fontSize: 15, color: 'var(--ink)' }}>Vineet Daniel</p>
              <p style={{ margin: 0, fontSize: 14.5, color: 'var(--body)', lineHeight: 1.65, maxWidth: 560 }}>
                CTO and technology generalist. I&apos;ve built teams and systems across engineering, product,
                AI, and cyber security — and taken startups from early chaos to mature operations. I write
                to think out loud and share what actually works.
              </p>
              <div style={{ display: 'flex', gap: 16, marginTop: 12 }}>
                <a href="https://twitter.com/vineetdaniel" target="_blank" rel="noopener noreferrer" className="link-accent" style={{ fontSize: 13, fontWeight: 600 }}>X / Twitter</a>
                <a href="https://linkedin.com/in/vineetdaniel" target="_blank" rel="noopener noreferrer" className="link-accent" style={{ fontSize: 13, fontWeight: 600 }}>LinkedIn</a>
              </div>
            </div>
          </section>
        </>
      )}
    </div>
  )
}

function PostRow({
  post,
  activeTag,
}: {
  post: { title: string; slug: string; excerpt: string | null; tags: string[]; publishedAt: Date | null }
  activeTag?: string
}) {
  return (
    <article style={{ borderTop: '1px solid var(--border)', padding: '24px 0' }}>
      <time style={{ fontFamily: 'var(--font-mono)', fontSize: 11.5, color: 'var(--faint)', display: 'block', marginBottom: 8, letterSpacing: '0.03em' }}>
        {post.publishedAt ? formatDate(post.publishedAt) : '—'}
      </time>
      <Link
        href={`/${post.slug}`}
        className="row-link"
        style={{ fontSize: 19, fontWeight: 700, color: 'var(--ink)', textDecoration: 'none', letterSpacing: '-0.02em', lineHeight: 1.3, display: 'block', marginBottom: post.excerpt ? 8 : 10 }}
      >
        {post.title}
      </Link>
      {post.excerpt && (
        <p style={{ fontSize: 14.5, color: 'var(--muted)', margin: '0 0 12px', lineHeight: 1.6 }}>
          {post.excerpt}
        </p>
      )}
      {post.tags.length > 0 && (
        <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
          {post.tags.map((t) => (
            <Link
              key={t}
              href={`/?tag=${encodeURIComponent(t)}`}
              style={{
                fontFamily: 'var(--font-mono)',
                fontSize: 11,
                color: t === activeTag ? 'var(--accent)' : 'var(--muted)',
                background: t === activeTag ? 'var(--accent-soft)' : 'var(--surface-2)',
                padding: '3px 9px',
                borderRadius: 4,
                textDecoration: 'none',
                fontWeight: t === activeTag ? 600 : 400,
              }}
            >
              {t}
            </Link>
          ))}
        </div>
      )}
    </article>
  )
}

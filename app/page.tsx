import type { Metadata } from 'next'
import Link from 'next/link'
import { db, publiclyVisible } from '@/lib/db'
import { formatDate } from '@/lib/utils'
import { TagCloud } from '@/components/TagCloud'
import { Scramble } from '@/components/Scramble'

export const metadata: Metadata = {
  title: 'Vineet Daniel',
  description: 'Writing on technology, engineering, AI, and building things.',
  alternates: { canonical: process.env.NEXT_PUBLIC_SITE_URL || 'https://www.vineetdaniel.com' },
  openGraph: {
    type: 'website',
    url: process.env.NEXT_PUBLIC_SITE_URL || 'https://www.vineetdaniel.com',
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
type PostItem = { title: string; slug: string; excerpt: string | null; tags: string[]; publishedAt: Date | null }

export default async function Home({ searchParams }: { searchParams: SearchParams }) {
  const { tag } = await searchParams

  let posts: PostItem[] = []
  let tagCounts: Record<string, number> = {}

  try {
    const allPosts = await db.post.findMany({
      where: publiclyVisible(),
      orderBy: { publishedAt: 'desc' },
      select: { title: true, slug: true, excerpt: true, tags: true, publishedAt: true },
    })

    tagCounts = allPosts.reduce<Record<string, number>>((acc, post) => {
      post.tags.forEach((t) => { acc[t] = (acc[t] ?? 0) + 1 })
      return acc
    }, {})

    posts = tag ? allPosts.filter((p) => p.tags.includes(tag)) : allPosts
  } catch {
    // DB not connected yet
  }

  const isFiltered = Boolean(tag)
  const [lead, ...rest] = posts

  return (
    <div>
      {/* Hero — scramble headline + beveled CTA, two-column grid */}
      {!isFiltered && (
        <section className="hero-grid" style={{ borderBottom: '1px solid var(--border)' }}>
          <div className="hero-left">
            <p className="eyebrow">field notes · technology leadership</p>
            <h1 style={{ fontSize: 48, fontWeight: 700, margin: '0 0 20px', letterSpacing: '-0.03em', lineHeight: 1.05, color: 'var(--ink)' }}>
              <Scramble text="Building and scaling" />
              <br />
              <Scramble text="technology, in the open." />
            </h1>
            <p style={{ fontSize: 17, color: 'var(--muted)', margin: '0 0 28px', lineHeight: 1.6, maxWidth: 480 }}>
              Engineering, product, AI, and cyber security — one generalist&apos;s notes
              on taking startups from early chaos to mature operations.
            </p>
            <a href="https://twitter.com/vineetdaniel" target="_blank" rel="noopener noreferrer" className="btn btn-solid">
              <span className="btn-inner">
                <span className="btn-text">Follow on X</span>
                <span className="btn-arrow">→</span>
              </span>
            </a>
          </div>
          <div className="striped" style={{ minHeight: 200 }} />
        </section>
      )}

      <div style={{ paddingTop: 36 }}>
        <TagCloud tags={tagCounts} activeTag={tag} />
      </div>

      {posts.length === 0 ? (
        <div style={{ padding: '48px 0 80px', color: 'var(--muted)' }}>
          {isFiltered ? (
            <p className="mono" style={{ fontSize: 13 }}>
              no posts tagged &quot;{tag}&quot; — <Link href="/" style={{ color: 'var(--ink)', textDecoration: 'underline' }}>clear filter</Link>
            </p>
          ) : (
            <p className="mono" style={{ fontSize: 13 }}>// no posts yet</p>
          )}
        </div>
      ) : isFiltered ? (
        <>
          <p className="mono" style={{ fontSize: 12, margin: '0 0 24px' }}>
            {posts.length} post{posts.length !== 1 ? 's' : ''} tagged &quot;{tag}&quot;
          </p>
          <div style={{ border: '1px solid var(--border)', borderTop: 'none' }}>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)' }} className="post-cell-grid">
              {posts.map((post) => <PostCell key={post.slug} post={post} />)}
            </div>
          </div>
        </>
      ) : (
        <>
          {/* Featured lead */}
          <p className="eyebrow">latest</p>
          <Link href={`/${lead.slug}`} className="cell-featured" style={{ marginBottom: 0 }}>
            <time className="mono" style={{ fontSize: 12, display: 'block', marginBottom: 16 }}>
              {lead.publishedAt ? formatDate(lead.publishedAt) : '—'}
            </time>
            <h2 style={{ fontSize: 32, fontWeight: 700, color: 'var(--ink)', letterSpacing: '-0.025em', lineHeight: 1.15, margin: '0 0 14px', maxWidth: 720 }}>
              {lead.title}
            </h2>
            {lead.excerpt && (
              <p style={{ fontSize: 16, color: 'var(--muted)', margin: 0, lineHeight: 1.6, maxWidth: 600 }}>
                {lead.excerpt}
              </p>
            )}
          </Link>

          <div className="striped" style={{ height: 40, borderLeft: '1px solid var(--border)', borderRight: '1px solid var(--border)' }} />

          {/* 3-column cell grid */}
          {rest.length > 0 && (
            <>
              <p className="eyebrow" style={{ marginTop: 40 }}>more writing</p>
              <div style={{ border: '1px solid var(--border)', borderTop: 'none', marginBottom: 80 }}>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)' }} className="post-cell-grid">
                  {rest.map((post) => <PostCell key={post.slug} post={post} />)}
                </div>
              </div>
            </>
          )}
        </>
      )}
    </div>
  )
}

function PostCell({ post }: { post: PostItem }) {
  return (
    <Link href={`/${post.slug}`} className="cell">
      <time className="mono" style={{ fontSize: 11.5, display: 'block', marginBottom: 12 }}>
        {post.publishedAt ? formatDate(post.publishedAt) : '—'}
      </time>
      <h3 style={{ fontSize: 19, fontWeight: 600, color: 'var(--ink)', letterSpacing: '-0.015em', lineHeight: 1.3, margin: '0 0 10px' }}>
        {post.title}
      </h3>
      {post.excerpt && (
        <p style={{ fontSize: 14, color: 'var(--muted)', margin: 0, lineHeight: 1.55, display: '-webkit-box', WebkitLineClamp: 3, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
          {post.excerpt}
        </p>
      )}
    </Link>
  )
}

import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import Link from 'next/link'
import { db, publiclyVisible } from '@/lib/db'
import { formatDate, readingTime } from '@/lib/utils'
import { PostContent } from '@/components/PostContent'
import { ShareButtons } from '@/components/ShareButtons'

type Params = Promise<{ slug: string }>

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || 'https://www.vineetdaniel.com'

export async function generateStaticParams() {
  try {
    const posts = await db.post.findMany({ where: publiclyVisible(), select: { slug: true } })
    return posts.map((p) => ({ slug: p.slug }))
  } catch {
    return []
  }
}

export async function generateMetadata({ params }: { params: Params }): Promise<Metadata> {
  const { slug } = await params
  try {
    const post = await db.post.findFirst({ where: { slug, ...publiclyVisible() } })
    if (!post) return {}

    const url = `${SITE_URL}/${slug}`
    const description = post.excerpt ?? post.content.slice(0, 160).replace(/[#*`\n]/g, ' ').trim()

    return {
      title: post.title,
      description,
      keywords: post.tags,
      authors: [{ name: 'Vineet Daniel', url: SITE_URL }],
      alternates: { canonical: url },
      openGraph: {
        type: 'article',
        url,
        title: post.title,
        description,
        siteName: 'Vineet Daniel',
        locale: 'en_US',
        publishedTime: post.publishedAt?.toISOString(),
        modifiedTime: post.updatedAt.toISOString(),
        authors: ['Vineet Daniel'],
        tags: post.tags,
      },
      twitter: {
        card: 'summary_large_image',
        title: post.title,
        description,
        creator: '@vineetdaniel',
        site: '@vineetdaniel',
      },
    }
  } catch {
    return {}
  }
}

export default async function PostPage({ params }: { params: Params }) {
  const { slug } = await params

  let post
  try {
    post = await db.post.findFirst({ where: { slug, ...publiclyVisible() } })
    if (post) {
      await db.post.update({ where: { id: post.id }, data: { views: { increment: 1 } } })
    }
  } catch {
    notFound()
  }

  if (!post) notFound()

  const url = `${SITE_URL}/${slug}`
  const description = post.excerpt ?? post.content.slice(0, 160).replace(/[#*`\n]/g, ' ').trim()

  const articleSchema = {
    '@context': 'https://schema.org',
    '@type': 'Article',
    headline: post.title,
    description,
    url,
    datePublished: post.publishedAt?.toISOString(),
    dateModified: post.updatedAt.toISOString(),
    keywords: post.tags.join(', '),
    wordCount: post.content.split(/\s+/).length,
    timeRequired: `PT${readingTime(post.content)}M`,
    author: {
      '@type': 'Person',
      name: 'Vineet Daniel',
      url: SITE_URL,
    },
    publisher: {
      '@type': 'Person',
      name: 'Vineet Daniel',
      url: SITE_URL,
    },
    mainEntityOfPage: { '@type': 'WebPage', '@id': url },
  }

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(articleSchema) }}
      />

      <article style={{ maxWidth: 720, margin: '0 auto' }}>
        <Link href="/" className="mono" style={{ fontSize: 12, color: 'var(--muted)', textDecoration: 'none', display: 'inline-block', margin: '36px 0 36px' }}>
          ← all posts
        </Link>

        <header style={{ marginBottom: 48, paddingBottom: 32, borderBottom: '1px solid var(--border)' }}>
          {post.tags.length > 0 && (
            <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', marginBottom: 20 }}>
              {post.tags.map((tag) => (
                <Link key={tag} href={`/?tag=${encodeURIComponent(tag)}`} style={{ fontFamily: 'var(--font-mono)', fontSize: 11, color: 'var(--body)', border: '1px solid var(--border-soft)', borderTopLeftRadius: '8px 12px', borderBottomRightRadius: '8px 12px', padding: '4px 11px', textDecoration: 'none', background: 'transparent' }}>
                  {tag}
                </Link>
              ))}
            </div>
          )}
          <h1 style={{ fontSize: 40, fontWeight: 700, letterSpacing: '-0.03em', lineHeight: 1.12, margin: '0 0 24px', color: 'var(--ink)' }}>
            {post.title}
          </h1>
          <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
            <div style={{ width: 40, height: 40, border: '1px solid var(--ink)', borderTopLeftRadius: '12px 18px', borderBottomRightRadius: '12px 18px', color: 'var(--ink)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 700, fontSize: 13, flexShrink: 0, fontFamily: 'var(--font-mono)' }}>
              vd
            </div>
            <div>
              <p style={{ margin: 0, fontSize: 14, fontWeight: 600, color: 'var(--ink)' }}>Vineet Daniel</p>
              <div className="mono" style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 12 }}>
                {post.publishedAt && (
                  <time dateTime={post.publishedAt.toISOString()}>{formatDate(post.publishedAt)}</time>
                )}
                <span>·</span>
                <span>{readingTime(post.content)} min read</span>
              </div>
            </div>
          </div>
        </header>

        <PostContent content={post.content} />

        <ShareButtons url={url} title={post.title} />

        {/* Author block */}
        <section style={{ marginTop: 48, paddingTop: 36, borderTop: '1px solid var(--border)', display: 'flex', gap: 18, alignItems: 'flex-start', flexWrap: 'wrap' }}>
          <div style={{ width: 52, height: 52, border: '1px solid var(--ink)', borderTopLeftRadius: '15px 24px', borderBottomRightRadius: '15px 24px', color: 'var(--ink)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 700, fontSize: 16, flexShrink: 0, fontFamily: 'var(--font-mono)' }}>
            vd
          </div>
          <div style={{ flex: 1, minWidth: 240 }}>
            <p style={{ margin: '0 0 6px', fontWeight: 700, fontSize: 15, color: 'var(--ink)' }}>Vineet Daniel</p>
            <p style={{ margin: 0, fontSize: 14.5, color: 'var(--muted)', lineHeight: 1.65 }}>
              CTO and technology generalist writing about engineering, product, AI, cyber security,
              and scaling startups from early chaos to mature operations.
            </p>
            <div className="mono" style={{ display: 'flex', gap: 16, marginTop: 12, fontSize: 12 }}>
              <a href="https://twitter.com/vineetdaniel" target="_blank" rel="noopener noreferrer" className="link-accent">x / twitter →</a>
              <a href="https://linkedin.com/in/vineetdaniel" target="_blank" rel="noopener noreferrer" className="link-accent">linkedin →</a>
            </div>
          </div>
        </section>
      </article>
    </>
  )
}

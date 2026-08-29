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
        <Link href="/" className="link-accent" style={{ fontSize: 13, color: 'var(--faint)', textDecoration: 'none', display: 'inline-block', marginBottom: 36, fontFamily: 'var(--font-mono)' }}>
          ← all posts
        </Link>

        <header style={{ marginBottom: 48, paddingBottom: 32, borderBottom: '1px solid var(--border)' }}>
          {post.tags.length > 0 && (
            <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap', marginBottom: 18 }}>
              {post.tags.map((tag) => (
                <Link key={tag} href={`/?tag=${encodeURIComponent(tag)}`} style={{ fontFamily: 'var(--font-mono)', fontSize: 11, color: 'var(--accent)', background: 'var(--accent-soft)', padding: '3px 9px', borderRadius: 4, textDecoration: 'none', fontWeight: 600, letterSpacing: '0.02em' }}>
                  {tag}
                </Link>
              ))}
            </div>
          )}
          <h1 style={{ fontSize: 40, fontWeight: 800, letterSpacing: '-0.04em', lineHeight: 1.12, margin: '0 0 24px', color: 'var(--ink)' }}>
            {post.title}
          </h1>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <div style={{ width: 40, height: 40, borderRadius: '50%', background: 'linear-gradient(135deg, var(--accent), #6d28d9)', color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 800, fontSize: 14, flexShrink: 0, letterSpacing: '-0.02em' }}>
              VD
            </div>
            <div>
              <p style={{ margin: 0, fontSize: 14, fontWeight: 600, color: 'var(--ink)' }}>Vineet Daniel</p>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, fontFamily: 'var(--font-mono)', fontSize: 12, color: 'var(--faint)' }}>
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
          <div style={{ width: 52, height: 52, borderRadius: '50%', background: 'linear-gradient(135deg, var(--accent), #6d28d9)', color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 800, fontSize: 18, flexShrink: 0, letterSpacing: '-0.02em' }}>
            VD
          </div>
          <div style={{ flex: 1, minWidth: 240 }}>
            <p style={{ margin: '0 0 6px', fontWeight: 700, fontSize: 15, color: 'var(--ink)' }}>Vineet Daniel</p>
            <p style={{ margin: 0, fontSize: 14.5, color: 'var(--body)', lineHeight: 1.65 }}>
              CTO and technology generalist writing about engineering, product, AI, cyber security,
              and scaling startups from early chaos to mature operations.
            </p>
            <div style={{ display: 'flex', gap: 16, marginTop: 12 }}>
              <a href="https://twitter.com/vineetdaniel" target="_blank" rel="noopener noreferrer" className="link-accent" style={{ fontSize: 13, fontWeight: 600 }}>X / Twitter</a>
              <a href="https://linkedin.com/in/vineetdaniel" target="_blank" rel="noopener noreferrer" className="link-accent" style={{ fontSize: 13, fontWeight: 600 }}>LinkedIn</a>
            </div>
          </div>
        </section>
      </article>
    </>
  )
}

import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import Link from 'next/link'
import { db } from '@/lib/db'
import { formatDate, readingTime } from '@/lib/utils'
import { PostContent } from '@/components/PostContent'
import { ShareButtons } from '@/components/ShareButtons'

type Params = Promise<{ slug: string }>

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || 'https://vineetdaniel-com.vercel.app'

export async function generateStaticParams() {
  try {
    const posts = await db.post.findMany({ where: { published: true }, select: { slug: true } })
    return posts.map((p) => ({ slug: p.slug }))
  } catch {
    return []
  }
}

export async function generateMetadata({ params }: { params: Params }): Promise<Metadata> {
  const { slug } = await params
  try {
    const post = await db.post.findUnique({ where: { slug, published: true } })
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
    post = await db.post.findUnique({ where: { slug, published: true } })
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

      <article>
        <Link href="/" style={{ fontSize: 13, color: '#9ca3af', textDecoration: 'none', display: 'inline-block', marginBottom: 32 }}>
          ← all posts
        </Link>

        <header style={{ marginBottom: 40 }}>
          <h1 style={{ fontSize: 28, fontWeight: 700, letterSpacing: '-0.03em', lineHeight: 1.25, margin: '0 0 16px', color: '#111' }}>
            {post.title}
          </h1>
          <div style={{ display: 'flex', alignItems: 'center', gap: 16, flexWrap: 'wrap' }}>
            {post.publishedAt && (
              <time dateTime={post.publishedAt.toISOString()} style={{ fontFamily: 'var(--font-mono)', fontSize: 12, color: '#9ca3af' }}>
                {formatDate(post.publishedAt)}
              </time>
            )}
            <span style={{ fontFamily: 'var(--font-mono)', fontSize: 12, color: '#9ca3af' }}>
              {readingTime(post.content)} min read
            </span>
            {post.tags.length > 0 && (
              <div style={{ display: 'flex', gap: 6 }}>
                {post.tags.map((tag) => (
                  <span key={tag} style={{ fontFamily: 'var(--font-mono)', fontSize: 11, color: '#6b7280', background: '#f3f4f6', padding: '2px 8px', borderRadius: 3 }}>
                    {tag}
                  </span>
                ))}
              </div>
            )}
          </div>
        </header>

        <PostContent content={post.content} />

        <ShareButtons url={url} title={post.title} />
      </article>
    </>
  )
}

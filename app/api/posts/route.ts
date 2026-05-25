import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { requireApiKey } from '@/lib/auth'

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url)
  const page = Math.max(1, parseInt(searchParams.get('page') ?? '1'))
  const limit = Math.min(50, Math.max(1, parseInt(searchParams.get('limit') ?? '20')))
  const tag = searchParams.get('tag')

  const where = {
    published: true,
    ...(tag ? { tags: { has: tag } } : {}),
  }

  const [posts, total] = await Promise.all([
    db.post.findMany({
      where,
      orderBy: { publishedAt: 'desc' },
      skip: (page - 1) * limit,
      take: limit,
      select: { id: true, title: true, slug: true, excerpt: true, tags: true, publishedAt: true, views: true },
    }),
    db.post.count({ where }),
  ])

  return NextResponse.json({
    data: posts,
    meta: { page, limit, total, pages: Math.ceil(total / limit) },
  })
}

export async function POST(request: NextRequest) {
  if (!requireApiKey(request)) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const body = await request.json()
  const { title, slug, excerpt, content, tags = [], published = false } = body

  if (!title || !slug || !content) {
    return NextResponse.json({ error: 'title, slug, and content are required' }, { status: 400 })
  }

  const post = await db.post.create({
    data: {
      title,
      slug,
      excerpt: excerpt ?? null,
      content,
      tags,
      published,
      publishedAt: published ? new Date() : null,
    },
  })

  return NextResponse.json({ data: post }, { status: 201 })
}

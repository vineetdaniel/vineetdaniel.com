import { NextRequest, NextResponse } from 'next/server'
import { db, publiclyVisible } from '@/lib/db'
import { requireApiKey } from '@/lib/auth'

type Params = Promise<{ id: string }>

export async function GET(request: NextRequest, { params }: { params: Params }) {
  const { id } = await params

  // Authenticated requests can fetch drafts and scheduled posts; public
  // requests only see posts that are published and past their publish date.
  const isAuthed = requireApiKey(request)

  const post = await db.post.findFirst({
    where: isAuthed
      ? { OR: [{ id }, { slug: id }] }
      : { AND: [{ OR: [{ id }, { slug: id }] }, publiclyVisible()] },
  })

  if (!post) return NextResponse.json({ error: 'Not found' }, { status: 404 })

  // Only count views for public reads of published posts.
  if (post.published && !isAuthed) {
    await db.post.update({ where: { id: post.id }, data: { views: { increment: 1 } } })
  }

  return NextResponse.json({ data: post })
}

export async function PUT(request: NextRequest, { params }: { params: Params }) {
  if (!requireApiKey(request)) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const { id } = await params
  const body = await request.json()

  const existing = await db.post.findFirst({ where: { OR: [{ id }, { slug: id }] } })
  if (!existing) return NextResponse.json({ error: 'Not found' }, { status: 404 })

  const data: Record<string, unknown> = {}
  if (body.title !== undefined) data.title = body.title
  if (body.slug !== undefined) data.slug = body.slug
  if (body.excerpt !== undefined) data.excerpt = body.excerpt
  if (body.content !== undefined) data.content = body.content
  if (body.tags !== undefined) data.tags = body.tags
  if (body.published !== undefined) {
    data.published = body.published
    if (body.published && !existing.publishedAt) data.publishedAt = new Date()
  }

  const post = await db.post.update({ where: { id: existing.id }, data })

  return NextResponse.json({ data: post })
}

export async function DELETE(request: NextRequest, { params }: { params: Params }) {
  if (!requireApiKey(request)) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const { id } = await params

  const existing = await db.post.findFirst({ where: { OR: [{ id }, { slug: id }] } })
  if (!existing) return NextResponse.json({ error: 'Not found' }, { status: 404 })

  await db.post.delete({ where: { id: existing.id } })

  return NextResponse.json({ data: { deleted: true } })
}

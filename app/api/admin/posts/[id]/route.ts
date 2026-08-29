import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { isAdmin } from '@/lib/auth'

type Params = Promise<{ id: string }>

export async function PATCH(request: NextRequest, { params }: { params: Params }) {
  if (!(await isAdmin())) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const { id } = await params
  const body = await request.json().catch(() => ({}))

  const existing = await db.post.findFirst({ where: { OR: [{ id }, { slug: id }] } })
  if (!existing) return NextResponse.json({ error: 'Not found' }, { status: 404 })

  const data: Record<string, unknown> = {}

  // Explicit publish date: backdate (past) or schedule (future).
  // Accepts an ISO string, or null to clear.
  let publishedAtProvided = false
  if ('publishedAt' in body) {
    publishedAtProvided = true
    if (body.publishedAt === null) {
      data.publishedAt = null
    } else if (typeof body.publishedAt === 'string') {
      const d = new Date(body.publishedAt)
      if (isNaN(d.getTime())) {
        return NextResponse.json({ error: 'Invalid publishedAt date' }, { status: 400 })
      }
      data.publishedAt = d
    }
  }

  if (typeof body.published === 'boolean') {
    data.published = body.published
    // If turning on publish without an explicit date and none set yet, default to now.
    if (body.published && !existing.publishedAt && !publishedAtProvided) {
      data.publishedAt = new Date()
    }
  }

  if (typeof body.title === 'string') data.title = body.title
  if (typeof body.excerpt === 'string') data.excerpt = body.excerpt
  if (typeof body.content === 'string') data.content = body.content
  if (Array.isArray(body.tags)) data.tags = body.tags

  const post = await db.post.update({ where: { id: existing.id }, data })
  return NextResponse.json({ data: post })
}

export async function DELETE(request: NextRequest, { params }: { params: Params }) {
  if (!(await isAdmin())) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const { id } = await params
  const existing = await db.post.findFirst({ where: { OR: [{ id }, { slug: id }] } })
  if (!existing) return NextResponse.json({ error: 'Not found' }, { status: 404 })

  await db.post.delete({ where: { id: existing.id } })
  return NextResponse.json({ data: { deleted: true } })
}

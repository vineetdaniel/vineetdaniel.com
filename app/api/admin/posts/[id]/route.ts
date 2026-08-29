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
  if (typeof body.published === 'boolean') {
    data.published = body.published
    if (body.published && !existing.publishedAt) data.publishedAt = new Date()
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

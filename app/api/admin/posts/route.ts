import { NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { isAdmin } from '@/lib/auth'

export async function GET() {
  if (!(await isAdmin())) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const posts = await db.post.findMany({
    orderBy: [{ published: 'asc' }, { createdAt: 'desc' }],
    select: {
      id: true,
      title: true,
      slug: true,
      excerpt: true,
      tags: true,
      published: true,
      publishedAt: true,
      createdAt: true,
      views: true,
    },
  })

  return NextResponse.json({ data: posts })
}

'use client'

import { useEffect, useState, useCallback } from 'react'

interface Post {
  id: string
  title: string
  slug: string
  excerpt: string | null
  tags: string[]
  published: boolean
  publishedAt: string | null
  createdAt: string
  views: number
}

function formatDate(d: string | null): string {
  if (!d) return '—'
  return new Date(d).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' })
}

export function AdminDashboard() {
  const [posts, setPosts] = useState<Post[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [busyId, setBusyId] = useState<string | null>(null)

  const load = useCallback(async () => {
    setError('')
    try {
      const res = await fetch('/api/admin/posts', { cache: 'no-store' })
      if (!res.ok) throw new Error('Failed to load posts')
      const json = await res.json()
      setPosts(json.data)
    } catch (e) {
      setError((e as Error).message)
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    load()
  }, [load])

  const setPublished = async (post: Post, published: boolean) => {
    setBusyId(post.id)
    try {
      const res = await fetch(`/api/admin/posts/${post.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ published }),
      })
      if (!res.ok) throw new Error('Update failed')
      await load()
    } catch (e) {
      setError((e as Error).message)
    } finally {
      setBusyId(null)
    }
  }

  const remove = async (post: Post) => {
    if (!confirm(`Delete "${post.title}"? This cannot be undone.`)) return
    setBusyId(post.id)
    try {
      const res = await fetch(`/api/admin/posts/${post.id}`, { method: 'DELETE' })
      if (!res.ok) throw new Error('Delete failed')
      await load()
    } catch (e) {
      setError((e as Error).message)
    } finally {
      setBusyId(null)
    }
  }

  const logout = async () => {
    await fetch('/api/admin/login', { method: 'DELETE' })
    window.location.reload()
  }

  const drafts = posts.filter((p) => !p.published)
  const live = posts.filter((p) => p.published)

  return (
    <div>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 16, marginBottom: 8, flexWrap: 'wrap' }}>
        <div>
          <p className="eyebrow" style={{ margin: '0 0 8px' }}>Admin</p>
          <h1 style={{ fontSize: 28, fontWeight: 800, letterSpacing: '-0.03em', margin: 0, color: 'var(--ink)' }}>
            Posts
          </h1>
        </div>
        <button onClick={logout} className="admin-btn-ghost">Sign out</button>
      </div>
      <p style={{ fontSize: 14, color: 'var(--muted)', margin: '4px 0 32px' }}>
        {live.length} published · {drafts.length} draft{drafts.length !== 1 ? 's' : ''}
      </p>

      {error && (
        <p style={{ color: '#be123c', fontSize: 14, marginBottom: 20 }}>{error}</p>
      )}

      {loading ? (
        <p style={{ color: 'var(--faint)', fontFamily: 'var(--font-mono)', fontSize: 13 }}>// loading…</p>
      ) : posts.length === 0 ? (
        <p style={{ color: 'var(--faint)', fontSize: 14 }}>No posts yet. Draft one with the agent.</p>
      ) : (
        <>
          {drafts.length > 0 && <Section title="Drafts" posts={drafts} busyId={busyId} onPublish={(p) => setPublished(p, true)} onUnpublish={(p) => setPublished(p, false)} onDelete={remove} />}
          {live.length > 0 && <Section title="Published" posts={live} busyId={busyId} onPublish={(p) => setPublished(p, true)} onUnpublish={(p) => setPublished(p, false)} onDelete={remove} />}
        </>
      )}
    </div>
  )
}

function Section({
  title,
  posts,
  busyId,
  onPublish,
  onUnpublish,
  onDelete,
}: {
  title: string
  posts: Post[]
  busyId: string | null
  onPublish: (p: Post) => void
  onUnpublish: (p: Post) => void
  onDelete: (p: Post) => void
}) {
  return (
    <section style={{ marginBottom: 40 }}>
      <p className="eyebrow">{title}</p>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
        {posts.map((post) => {
          const busy = busyId === post.id
          return (
            <div key={post.id} className="admin-card">
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap', marginBottom: 4 }}>
                  <span
                    style={{
                      fontFamily: 'var(--font-mono)',
                      fontSize: 10,
                      textTransform: 'uppercase',
                      letterSpacing: '0.08em',
                      padding: '2px 7px',
                      borderRadius: 4,
                      color: post.published ? '#0f766e' : '#b45309',
                      background: post.published ? '#ecfdf5' : '#fffbeb',
                    }}
                  >
                    {post.published ? 'Live' : 'Draft'}
                  </span>
                  <span style={{ fontFamily: 'var(--font-mono)', fontSize: 11, color: 'var(--faint)' }}>
                    {post.published ? formatDate(post.publishedAt) : formatDate(post.createdAt)} · {post.views} views
                  </span>
                </div>
                <p style={{ fontSize: 15, fontWeight: 700, color: 'var(--ink)', margin: '0 0 2px', letterSpacing: '-0.01em', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                  {post.title}
                </p>
                {post.tags.length > 0 && (
                  <p style={{ fontFamily: 'var(--font-mono)', fontSize: 11, color: 'var(--muted)', margin: 0 }}>
                    {post.tags.join(' · ')}
                  </p>
                )}
              </div>
              <div className="admin-card-actions">
                <a href={`/${post.slug}`} target="_blank" rel="noopener noreferrer" className="admin-btn-ghost">View</a>
                {post.published ? (
                  <button onClick={() => onUnpublish(post)} disabled={busy} className="admin-btn-ghost">
                    {busy ? '…' : 'Unpublish'}
                  </button>
                ) : (
                  <button onClick={() => onPublish(post)} disabled={busy} className="admin-btn-primary">
                    {busy ? '…' : 'Publish'}
                  </button>
                )}
                <button onClick={() => onDelete(post)} disabled={busy} className="admin-btn-danger">Delete</button>
              </div>
            </div>
          )
        })}
      </div>
    </section>
  )
}

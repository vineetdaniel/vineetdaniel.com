import Link from 'next/link'
import type { CSSProperties } from 'react'

interface TagCloudProps {
  tags: Record<string, number>
  activeTag?: string
}

export function TagCloud({ tags, activeTag }: TagCloudProps) {
  const sorted = Object.entries(tags).sort((a, b) => b[1] - a[1])
  if (sorted.length === 0) return null

  const chip = (active: boolean): CSSProperties => ({
    fontFamily: 'var(--font-mono)',
    fontSize: 11,
    padding: '5px 12px',
    textDecoration: 'none',
    border: '1px solid var(--border-soft)',
    borderTopLeftRadius: '8px 12px',
    borderBottomRightRadius: '8px 12px',
    background: active ? 'var(--ink)' : 'transparent',
    color: active ? 'var(--bg)' : 'var(--muted)',
  })

  return (
    <div style={{ marginBottom: 36 }}>
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8, alignItems: 'center' }}>
        <Link href="/" style={chip(!activeTag)}>all</Link>
        {sorted.map(([tag, count]) => (
          <Link
            key={tag}
            href={activeTag === tag ? '/' : `/?tag=${encodeURIComponent(tag)}`}
            style={chip(activeTag === tag)}
          >
            {tag}
            <span style={{ marginLeft: 6, opacity: 0.55 }}>{count}</span>
          </Link>
        ))}
      </div>
    </div>
  )
}

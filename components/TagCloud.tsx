import Link from 'next/link'

interface TagCloudProps {
  tags: Record<string, number>
  activeTag?: string
}

export function TagCloud({ tags, activeTag }: TagCloudProps) {
  const sorted = Object.entries(tags).sort((a, b) => b[1] - a[1])
  if (sorted.length === 0) return null

  return (
    <div style={{ marginBottom: 40 }}>
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6, alignItems: 'center' }}>
        <Link
          href="/"
          style={{
            fontFamily: 'var(--font-mono)',
            fontSize: 11,
            padding: '3px 10px',
            borderRadius: 3,
            textDecoration: 'none',
            background: !activeTag ? '#111' : '#f3f4f6',
            color: !activeTag ? '#fff' : '#6b7280',
          }}
        >
          all
        </Link>
        {sorted.map(([tag, count]) => (
          <Link
            key={tag}
            href={activeTag === tag ? '/' : `/?tag=${encodeURIComponent(tag)}`}
            style={{
              fontFamily: 'var(--font-mono)',
              fontSize: 11,
              padding: '3px 10px',
              borderRadius: 3,
              textDecoration: 'none',
              background: activeTag === tag ? '#111' : '#f3f4f6',
              color: activeTag === tag ? '#fff' : '#6b7280',
            }}
          >
            {tag}
            <span style={{ marginLeft: 5, opacity: 0.5 }}>{count}</span>
          </Link>
        ))}
      </div>
    </div>
  )
}

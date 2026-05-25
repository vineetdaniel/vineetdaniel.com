'use client'

import { useState } from 'react'

const linkStyle: React.CSSProperties = {
  fontSize: 13,
  color: '#6b7280',
  textDecoration: 'none',
  fontFamily: 'var(--font-mono)',
  background: '#f3f4f6',
  padding: '5px 12px',
  borderRadius: 3,
  display: 'inline-block',
  transition: 'color 0.15s',
}

export function ShareButtons({ url, title }: { url: string; title: string }) {
  const [copied, setCopied] = useState(false)

  const twitterUrl = `https://twitter.com/intent/tweet?text=${encodeURIComponent(title)}&url=${encodeURIComponent(url)}`
  const linkedinUrl = `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(url)}`

  const copyLink = async () => {
    try {
      await navigator.clipboard.writeText(url)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    } catch {
      // fallback: select input
    }
  }

  return (
    <div style={{ borderTop: '1px solid #e5e7eb', marginTop: 56, paddingTop: 24 }}>
      <p style={{ fontSize: 12, color: '#9ca3af', fontFamily: 'var(--font-mono)', marginBottom: 12 }}>
        // share
      </p>
      <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
        <a
          href={twitterUrl}
          target="_blank"
          rel="noopener noreferrer"
          style={linkStyle}
        >
          X / Twitter
        </a>
        <a
          href={linkedinUrl}
          target="_blank"
          rel="noopener noreferrer"
          style={linkStyle}
        >
          LinkedIn
        </a>
        <button
          onClick={copyLink}
          style={{
            ...linkStyle,
            border: 'none',
            cursor: 'pointer',
            color: copied ? '#16a34a' : '#6b7280',
          }}
        >
          {copied ? 'Copied!' : 'Copy link'}
        </button>
      </div>
    </div>
  )
}

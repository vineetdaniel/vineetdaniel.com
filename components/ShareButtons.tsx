'use client'

import { useState } from 'react'

const linkStyle: React.CSSProperties = {
  fontSize: 13,
  color: 'var(--muted)',
  textDecoration: 'none',
  fontFamily: 'var(--font-mono)',
  background: 'var(--surface-2)',
  padding: '6px 13px',
  borderRadius: 4,
  display: 'inline-block',
  transition: 'color 0.15s, background 0.15s',
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
    <div style={{ borderTop: '1px solid var(--border)', marginTop: 56, paddingTop: 28 }}>
      <p style={{ fontSize: 12, color: 'var(--faint)', fontFamily: 'var(--font-mono)', marginBottom: 12 }}>
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
            color: copied ? '#0f766e' : 'var(--muted)',
          }}
        >
          {copied ? 'Copied!' : 'Copy link'}
        </button>
      </div>
    </div>
  )
}

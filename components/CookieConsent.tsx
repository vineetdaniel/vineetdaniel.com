'use client'

import { useEffect, useState } from 'react'

const STORAGE_KEY = 'cookie_consent'

type Consent = 'granted' | 'denied'

declare global {
  interface Window {
    gtag?: (...args: unknown[]) => void
  }
}

function updateGtagConsent(state: Consent) {
  if (typeof window === 'undefined' || typeof window.gtag !== 'function') return
  const value = state === 'granted' ? 'granted' : 'denied'
  window.gtag('consent', 'update', {
    ad_storage: value,
    ad_user_data: value,
    ad_personalization: value,
    analytics_storage: value,
  })
}

export function CookieConsent() {
  const [visible, setVisible] = useState(false)

  useEffect(() => {
    // Only show the banner if the visitor hasn't made a choice yet.
    try {
      const stored = localStorage.getItem(STORAGE_KEY)
      if (stored !== 'granted' && stored !== 'denied') {
        setVisible(true)
      }
    } catch {
      setVisible(true)
    }
  }, [])

  const choose = (state: Consent) => {
    try {
      localStorage.setItem(STORAGE_KEY, state)
    } catch {
      // ignore storage failures (private mode, etc.)
    }
    updateGtagConsent(state)
    setVisible(false)
  }

  if (!visible) return null

  return (
    <div
      role="dialog"
      aria-live="polite"
      aria-label="Cookie consent"
      style={{
        position: 'fixed',
        left: 16,
        right: 16,
        bottom: 16,
        zIndex: 1000,
        maxWidth: 440,
        margin: '0 auto',
        background: 'var(--bg)',
        border: '1px solid var(--border-strong)',
        borderRadius: 14,
        boxShadow: '0 18px 50px -18px rgba(16, 24, 40, 0.35)',
        padding: '20px 22px',
      }}
    >
      <p style={{ margin: '0 0 6px', fontSize: 14, fontWeight: 700, color: 'var(--ink)', letterSpacing: '-0.01em' }}>
        A quick note on cookies
      </p>
      <p style={{ margin: '0 0 16px', fontSize: 13.5, color: 'var(--body)', lineHeight: 1.6 }}>
        I use privacy-friendly analytics to understand what people read here. You can accept to help
        me improve, or decline — the site works either way.
      </p>
      <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
        <button
          onClick={() => choose('granted')}
          className="cc-accept"
          style={{
            fontSize: 13,
            fontWeight: 600,
            color: '#fff',
            background: 'var(--accent)',
            border: 'none',
            borderRadius: 8,
            padding: '9px 18px',
            cursor: 'pointer',
            transition: 'background 0.15s ease',
          }}
        >
          Accept
        </button>
        <button
          onClick={() => choose('denied')}
          className="cc-decline"
          style={{
            fontSize: 13,
            fontWeight: 600,
            color: 'var(--body)',
            background: 'var(--surface-2)',
            border: '1px solid var(--border)',
            borderRadius: 8,
            padding: '9px 18px',
            cursor: 'pointer',
            transition: 'background 0.15s ease, color 0.15s ease',
          }}
        >
          Decline
        </button>
      </div>
    </div>
  )
}

'use client'

import { useState } from 'react'

export function AdminLogin() {
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const submit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setLoading(true)
    try {
      const res = await fetch('/api/admin/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ password }),
      })
      if (res.ok) {
        window.location.reload()
      } else {
        const json = await res.json().catch(() => ({}))
        setError(json.error || 'Login failed')
      }
    } catch {
      setError('Network error')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div style={{ maxWidth: 380, margin: '8vh auto 0' }}>
      <p className="eyebrow">Admin</p>
      <h1 style={{ fontSize: 28, fontWeight: 800, letterSpacing: '-0.03em', margin: '0 0 8px', color: 'var(--ink)' }}>
        Sign in
      </h1>
      <p style={{ fontSize: 15, color: 'var(--body)', margin: '0 0 24px', lineHeight: 1.6 }}>
        Enter the admin password to manage posts.
      </p>
      <form onSubmit={submit}>
        <input
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          placeholder="Password"
          autoFocus
          style={{
            width: '100%',
            fontSize: 16,
            padding: '12px 14px',
            border: '1px solid var(--border-strong)',
            borderRadius: 10,
            outline: 'none',
            marginBottom: 12,
            background: 'var(--bg)',
            color: 'var(--ink)',
          }}
        />
        {error && (
          <p style={{ color: '#be123c', fontSize: 13, margin: '0 0 12px' }}>{error}</p>
        )}
        <button
          type="submit"
          disabled={loading || !password}
          className="cc-accept"
          style={{
            width: '100%',
            fontSize: 14,
            fontWeight: 600,
            color: '#fff',
            background: 'var(--accent)',
            border: 'none',
            borderRadius: 10,
            padding: '12px 18px',
            cursor: loading || !password ? 'default' : 'pointer',
            opacity: loading || !password ? 0.6 : 1,
          }}
        >
          {loading ? 'Signing in…' : 'Sign in'}
        </button>
      </form>
    </div>
  )
}

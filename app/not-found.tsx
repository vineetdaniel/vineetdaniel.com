import Link from 'next/link'
export default function NotFound() {
  return (
    <div style={{ paddingTop: 80 }}>
      <p style={{ fontFamily: 'var(--font-mono)', fontSize: 13, color: '#9ca3af', marginBottom: 12 }}>404</p>
      <h1 style={{ fontSize: 22, fontWeight: 700, letterSpacing: '-0.02em', marginBottom: 12 }}>Not found</h1>
      <Link href="/" style={{ fontSize: 14, color: '#2563eb' }}>← back to writing</Link>
    </div>
  )
}

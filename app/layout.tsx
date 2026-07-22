import type { Metadata } from 'next'
import { Geist, JetBrains_Mono } from 'next/font/google'
import Link from 'next/link'
import './globals.css'

const geist = Geist({ subsets: ['latin'], variable: '--font-geist' })
const mono = JetBrains_Mono({ subsets: ['latin'], variable: '--font-mono' })

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || 'https://vineetdaniel-com.vercel.app'

const websiteSchema = {
  '@context': 'https://schema.org',
  '@type': 'WebSite',
  name: 'Vineet Daniel',
  url: SITE_URL,
  description: 'Writing on technology, engineering, AI, and building things.',
  author: {
    '@type': 'Person',
    name: 'Vineet Daniel',
    url: SITE_URL,
    sameAs: [
      'https://twitter.com/vineetdaniel',
      'https://linkedin.com/in/vineetdaniel',
      'https://github.com/vineetdaniel',
    ],
  },
}

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: {
    default: 'Vineet Daniel',
    template: '%s — Vineet Daniel',
  },
  description: 'Writing on technology, engineering, AI, and building things.',
  keywords: ['technology', 'engineering', 'AI', 'product', 'startup', 'cyber security'],
  authors: [{ name: 'Vineet Daniel', url: SITE_URL }],
  creator: 'Vineet Daniel',
  publisher: 'Vineet Daniel',
  robots: {
    index: true,
    follow: true,
    googleBot: { index: true, follow: true, 'max-snippet': -1, 'max-image-preview': 'large' },
  },
  openGraph: {
    type: 'website',
    locale: 'en_US',
    url: SITE_URL,
    siteName: 'Vineet Daniel',
    title: 'Vineet Daniel',
    description: 'Writing on technology, engineering, AI, and building things.',
  },
  twitter: {
    card: 'summary',
    site: '@vineetdaniel',
    creator: '@vineetdaniel',
    title: 'Vineet Daniel',
    description: 'Writing on technology, engineering, AI, and building things.',
  },
  alternates: {
    canonical: SITE_URL,
    types: { 'application/rss+xml': `${SITE_URL}/feed.xml` },
  },
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={`${geist.variable} ${mono.variable}`}>
      <head>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(websiteSchema) }}
        />
        <script src="https://app.secureprivacy.ai/script/6a60c8c16a00550094f05a9a.js" async></script>
        <script async src="https://www.googletagmanager.com/gtag/js?id=G-JBVGVTP624"></script>
        <script
          dangerouslySetInnerHTML={{
            __html: `
              window.dataLayer = window.dataLayer || [];
              function gtag(){dataLayer.push(arguments);}
              gtag('js', new Date());
              gtag('config', 'G-JBVGVTP624');
            `,
          }}
        />
      </head>
      <body style={{ fontFamily: 'var(--font-geist), system-ui, sans-serif', backgroundColor: '#fff', color: '#111', margin: 0 }}>
        <div style={{ maxWidth: 680, margin: '0 auto', padding: '0 24px' }}>
          <header style={{ borderBottom: '1px solid #e5e7eb', padding: '20px 0', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <Link href="/" style={{ fontWeight: 700, fontSize: 16, color: '#111', textDecoration: 'none', letterSpacing: '-0.01em' }}>
              Vineet Daniel
            </Link>
            <nav style={{ display: 'flex', gap: 24 }}>
              <Link href="/" style={{ fontSize: 14, color: '#6b7280', textDecoration: 'none' }}>Writing</Link>
              <Link href="/api/posts" style={{ fontSize: 14, color: '#6b7280', textDecoration: 'none', fontFamily: 'var(--font-mono)' }}>API</Link>
            </nav>
          </header>
          <main style={{ minHeight: 'calc(100vh - 130px)', paddingTop: 48 }}>
            {children}
          </main>
          <footer style={{ borderTop: '1px solid #e5e7eb', padding: '24px 0', marginTop: 64 }}>
            <p style={{ fontSize: 13, color: '#9ca3af', margin: 0 }}>
              © {new Date().getFullYear()} Vineet Daniel ·{' '}
              <a href="/api/posts" style={{ color: '#9ca3af' }}>JSON API</a> ·{' '}
              <a href="/sitemap.xml" style={{ color: '#9ca3af' }}>Sitemap</a>
            </p>
          </footer>
        </div>
      </body>
    </html>
  )
}

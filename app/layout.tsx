import type { Metadata } from 'next'
import { Geist, JetBrains_Mono } from 'next/font/google'
import Link from 'next/link'
import { CookieConsent } from '@/components/CookieConsent'
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
        {/* Google Consent Mode defaults — must run before GA config. Analytics
            storage is denied until the visitor accepts via the cookie banner. */}
        <script
          dangerouslySetInnerHTML={{
            __html: `
              window.dataLayer = window.dataLayer || [];
              function gtag(){dataLayer.push(arguments);}
              gtag('consent', 'default', {
                ad_storage: 'denied',
                ad_user_data: 'denied',
                ad_personalization: 'denied',
                analytics_storage: 'denied',
              });
              // Apply a previously stored choice as early as possible.
              try {
                if (localStorage.getItem('cookie_consent') === 'granted') {
                  gtag('consent', 'update', {
                    ad_storage: 'granted',
                    ad_user_data: 'granted',
                    ad_personalization: 'granted',
                    analytics_storage: 'granted',
                  });
                }
              } catch (e) {}
            `,
          }}
        />
        <script async src="https://www.googletagmanager.com/gtag/js?id=G-JBVGVTP624"></script>
        <script
          dangerouslySetInnerHTML={{
            __html: `
              gtag('js', new Date());
              gtag('config', 'G-JBVGVTP624');
            `,
          }}
        />
      </head>
      <body style={{ fontFamily: 'var(--font-geist), system-ui, sans-serif', backgroundColor: 'var(--bg)', color: 'var(--ink)', margin: 0 }}>
        {/* Thin accent bar */}
        <div style={{ height: 3, background: 'linear-gradient(90deg, var(--accent) 0%, #6d28d9 100%)' }} />

        {/* Masthead */}
        <header style={{ borderBottom: '1px solid var(--border)', background: 'var(--bg)' }}>
          <div style={{ maxWidth: 1000, margin: '0 auto', padding: '22px 32px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 24 }}>
            <div>
              <Link href="/" style={{ fontWeight: 800, fontSize: 19, color: 'var(--ink)', textDecoration: 'none', letterSpacing: '-0.03em', display: 'block' }}>
                Vineet Daniel
              </Link>
              <p style={{ margin: '3px 0 0', fontSize: 12.5, color: 'var(--muted)', letterSpacing: '0.01em', lineHeight: 1.4 }}>
                CTO · technology generalist · scaling teams and systems
              </p>
            </div>
            <nav style={{ display: 'flex', gap: 26, flexShrink: 0, alignItems: 'center' }}>
              <Link href="/" className="nav-link" style={{ fontSize: 14, color: 'var(--body)', textDecoration: 'none', fontWeight: 500 }}>Writing</Link>
              <a href="https://twitter.com/vineetdaniel" target="_blank" rel="noopener noreferrer" className="nav-link" style={{ fontSize: 14, color: 'var(--body)', textDecoration: 'none', fontWeight: 500 }}>X</a>
              <a href="https://linkedin.com/in/vineetdaniel" target="_blank" rel="noopener noreferrer" className="nav-link" style={{ fontSize: 14, color: 'var(--body)', textDecoration: 'none', fontWeight: 500 }}>LinkedIn</a>
            </nav>
          </div>
        </header>

        <main style={{ maxWidth: 1000, margin: '0 auto', padding: '0 32px', minHeight: 'calc(100vh - 200px)', paddingTop: 56 }}>
          {children}
        </main>

        <footer style={{ borderTop: '1px solid var(--border)', marginTop: 88, background: 'var(--surface)' }}>
          <div style={{ maxWidth: 1000, margin: '0 auto', padding: '32px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 20, flexWrap: 'wrap' }}>
            <p style={{ fontSize: 13, color: 'var(--faint)', margin: 0, lineHeight: 1.6 }}>
              © {new Date().getFullYear()} Vineet Daniel · Written from the field.
            </p>
            <p style={{ fontSize: 13, color: 'var(--faint)', margin: 0, display: 'flex', gap: 14 }}>
              <a href="https://twitter.com/vineetdaniel" target="_blank" rel="noopener noreferrer" style={{ color: 'var(--faint)', textDecoration: 'none' }}>X</a>
              <a href="https://linkedin.com/in/vineetdaniel" target="_blank" rel="noopener noreferrer" style={{ color: 'var(--faint)', textDecoration: 'none' }}>LinkedIn</a>
              <a href="/api/posts" style={{ color: 'var(--faint)', textDecoration: 'none' }}>API</a>
              <a href="/sitemap.xml" style={{ color: 'var(--faint)', textDecoration: 'none' }}>Sitemap</a>
            </p>
          </div>
        </footer>

        <CookieConsent />
      </body>
    </html>
  )
}

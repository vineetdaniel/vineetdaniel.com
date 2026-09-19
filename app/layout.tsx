import type { Metadata } from 'next'
import { Rethink_Sans, DM_Mono } from 'next/font/google'
import Link from 'next/link'
import { CookieConsent } from '@/components/CookieConsent'
import './globals.css'

const sans = Rethink_Sans({ subsets: ['latin'], variable: '--font-sans-var' })
const mono = DM_Mono({ subsets: ['latin'], weight: ['400', '500'], variable: '--font-mono-var' })

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || 'https://www.vineetdaniel.com'

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
    <html lang="en" className={`${sans.variable} ${mono.variable}`}>
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
      <body style={{ fontFamily: 'var(--font-sans-var), system-ui, sans-serif', backgroundColor: 'var(--bg)', color: 'var(--ink)', margin: 0 }}>
        {/* Masthead — bordered section like Prism nav */}
        <header style={{ borderBottom: '1px solid var(--border)' }}>
          <div style={{ maxWidth: 1200, margin: '0 auto', padding: '0 24px', display: 'flex', alignItems: 'stretch', justifyContent: 'space-between', gap: 24 }}>
            <div style={{ padding: '20px 24px 20px 0', borderRight: '1px solid var(--border-soft)' }}>
              <Link href="/" style={{ fontWeight: 700, fontSize: 18, color: 'var(--ink)', textDecoration: 'none', letterSpacing: '-0.02em', display: 'block' }}>
                Vineet Daniel
              </Link>
              <p className="mono" style={{ margin: '2px 0 0', fontSize: 11, color: 'var(--muted)' }}>
                cto · generalist · scaling systems
              </p>
            </div>
            <nav style={{ display: 'flex', gap: 28, flexShrink: 0, alignItems: 'center' }}>
              <Link href="/" className="nav-link mono" style={{ fontSize: 13, color: 'var(--body)', textDecoration: 'none' }}>Writing</Link>
              <a href="https://twitter.com/vineetdaniel" target="_blank" rel="noopener noreferrer" className="nav-link mono" style={{ fontSize: 13, color: 'var(--body)', textDecoration: 'none' }}>X</a>
              <a href="https://linkedin.com/in/vineetdaniel" target="_blank" rel="noopener noreferrer" className="nav-link mono" style={{ fontSize: 13, color: 'var(--body)', textDecoration: 'none' }}>LinkedIn</a>
            </nav>
          </div>
        </header>

        <main style={{ maxWidth: 1200, margin: '0 auto', padding: '0 24px', minHeight: 'calc(100vh - 200px)' }}>
          {children}
        </main>

        <footer style={{ borderTop: '1px solid var(--border)', marginTop: 0 }}>
          <div className="striped" style={{ height: 40, borderBottom: '1px solid var(--border)' }} />
          <div style={{ maxWidth: 1200, margin: '0 auto', padding: '28px 24px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 20, flexWrap: 'wrap' }}>
            <p className="mono" style={{ fontSize: 12, color: 'var(--muted)', margin: 0 }}>
              © {new Date().getFullYear()} Vineet Daniel — written from the field
            </p>
            <p className="mono" style={{ fontSize: 12, color: 'var(--muted)', margin: 0, display: 'flex', gap: 16 }}>
              <a href="https://twitter.com/vineetdaniel" target="_blank" rel="noopener noreferrer" style={{ color: 'var(--muted)', textDecoration: 'none' }}>x</a>
              <a href="https://linkedin.com/in/vineetdaniel" target="_blank" rel="noopener noreferrer" style={{ color: 'var(--muted)', textDecoration: 'none' }}>linkedin</a>
              <a href="/api/posts" style={{ color: 'var(--muted)', textDecoration: 'none' }}>api</a>
              <a href="/sitemap.xml" style={{ color: 'var(--muted)', textDecoration: 'none' }}>sitemap</a>
            </p>
          </div>
        </footer>

        <CookieConsent />
      </body>
    </html>
  )
}

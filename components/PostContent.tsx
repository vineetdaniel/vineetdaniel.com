'use client'

import ReactMarkdown from 'react-markdown'
import remarkGfm from 'remark-gfm'
import rehypeHighlight from 'rehype-highlight'

export function PostContent({ content }: { content: string }) {
  return (
    <div style={{ lineHeight: 1.8, fontSize: 17, color: 'var(--body)' }}>
      <ReactMarkdown
        remarkPlugins={[remarkGfm]}
        rehypePlugins={[rehypeHighlight]}
        components={{
          h1: ({ children }) => <h1 style={{ fontSize: 26, fontWeight: 700, letterSpacing: '-0.025em', margin: '48px 0 18px', color: 'var(--ink)', lineHeight: 1.3 }}>{children}</h1>,
          h2: ({ children }) => <h2 style={{ fontSize: 22, fontWeight: 700, letterSpacing: '-0.02em', margin: '42px 0 14px', color: 'var(--ink)', lineHeight: 1.35 }}>{children}</h2>,
          h3: ({ children }) => <h3 style={{ fontSize: 18, fontWeight: 600, margin: '32px 0 10px', color: 'var(--ink)' }}>{children}</h3>,
          p: ({ children }) => <p style={{ margin: '0 0 22px', lineHeight: 1.8 }}>{children}</p>,
          a: ({ href, children }) => <a href={href} className="link-accent" style={{ color: 'var(--accent)', textDecoration: 'underline', textUnderlineOffset: 3, textDecorationColor: 'var(--accent-soft)' }}>{children}</a>,
          blockquote: ({ children }) => (
            <blockquote style={{ borderLeft: '3px solid var(--accent)', paddingLeft: 22, margin: '28px 0', color: 'var(--muted)', fontStyle: 'italic', fontSize: 18 }}>{children}</blockquote>
          ),
          code: ({ inline, className, children, ...props }: { inline?: boolean; className?: string; children?: React.ReactNode }) =>
            inline ? (
              <code style={{ fontFamily: 'var(--font-mono)', fontSize: 14, background: 'var(--surface-2)', padding: '2px 6px', borderRadius: 4, color: 'var(--accent-hover)' }} {...props}>{children}</code>
            ) : (
              <code className={className} style={{ fontFamily: 'var(--font-mono)', fontSize: 13.5 }} {...props}>{children}</code>
            ),
          pre: ({ children }) => (
            <pre style={{ background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 8, padding: '18px 22px', overflowX: 'auto', margin: '28px 0', fontSize: 13.5, lineHeight: 1.65 }}>{children}</pre>
          ),
          ul: ({ children }) => <ul style={{ paddingLeft: 24, margin: '0 0 22px', lineHeight: 1.8 }}>{children}</ul>,
          ol: ({ children }) => <ol style={{ paddingLeft: 24, margin: '0 0 22px', lineHeight: 1.8 }}>{children}</ol>,
          li: ({ children }) => <li style={{ marginBottom: 8 }}>{children}</li>,
          hr: () => <hr style={{ border: 'none', borderTop: '1px solid var(--border)', margin: '48px 0' }} />,
          strong: ({ children }) => <strong style={{ fontWeight: 600, color: 'var(--ink)' }}>{children}</strong>,
          table: ({ children }) => <table style={{ width: '100%', borderCollapse: 'collapse', margin: '28px 0', fontSize: 15 }}>{children}</table>,
          th: ({ children }) => <th style={{ textAlign: 'left', padding: '10px 14px', borderBottom: '2px solid var(--border-strong)', fontWeight: 600, color: 'var(--ink)' }}>{children}</th>,
          td: ({ children }) => <td style={{ padding: '10px 14px', borderBottom: '1px solid var(--border)', color: 'var(--body)' }}>{children}</td>,
        }}
      >
        {content}
      </ReactMarkdown>
    </div>
  )
}

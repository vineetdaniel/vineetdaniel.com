'use client'

import ReactMarkdown from 'react-markdown'
import remarkGfm from 'remark-gfm'
import rehypeHighlight from 'rehype-highlight'

export function PostContent({ content }: { content: string }) {
  return (
    <div style={{ lineHeight: 1.75, fontSize: 16, color: '#374151' }}>
      <ReactMarkdown
        remarkPlugins={[remarkGfm]}
        rehypePlugins={[rehypeHighlight]}
        components={{
          h1: ({ children }) => <h1 style={{ fontSize: 24, fontWeight: 700, letterSpacing: '-0.02em', margin: '40px 0 16px', color: '#111' }}>{children}</h1>,
          h2: ({ children }) => <h2 style={{ fontSize: 20, fontWeight: 600, letterSpacing: '-0.01em', margin: '36px 0 12px', color: '#111' }}>{children}</h2>,
          h3: ({ children }) => <h3 style={{ fontSize: 17, fontWeight: 600, margin: '28px 0 10px', color: '#111' }}>{children}</h3>,
          p: ({ children }) => <p style={{ margin: '0 0 20px', lineHeight: 1.75 }}>{children}</p>,
          a: ({ href, children }) => <a href={href} style={{ color: '#2563eb', textDecoration: 'underline', textUnderlineOffset: 3 }}>{children}</a>,
          blockquote: ({ children }) => (
            <blockquote style={{ borderLeft: '3px solid #e5e7eb', paddingLeft: 20, margin: '24px 0', color: '#6b7280' }}>{children}</blockquote>
          ),
          code: ({ inline, className, children, ...props }: { inline?: boolean; className?: string; children?: React.ReactNode }) =>
            inline ? (
              <code style={{ fontFamily: 'var(--font-mono)', fontSize: 13, background: '#f3f4f6', padding: '2px 6px', borderRadius: 3, color: '#111' }} {...props}>{children}</code>
            ) : (
              <code className={className} style={{ fontFamily: 'var(--font-mono)', fontSize: 13 }} {...props}>{children}</code>
            ),
          pre: ({ children }) => (
            <pre style={{ background: '#f8f8f8', border: '1px solid #e5e7eb', padding: '16px 20px', overflowX: 'auto', margin: '24px 0', fontSize: 13, lineHeight: 1.6 }}>{children}</pre>
          ),
          ul: ({ children }) => <ul style={{ paddingLeft: 24, margin: '0 0 20px', lineHeight: 1.75 }}>{children}</ul>,
          ol: ({ children }) => <ol style={{ paddingLeft: 24, margin: '0 0 20px', lineHeight: 1.75 }}>{children}</ol>,
          li: ({ children }) => <li style={{ marginBottom: 6 }}>{children}</li>,
          hr: () => <hr style={{ border: 'none', borderTop: '1px solid #e5e7eb', margin: '40px 0' }} />,
          strong: ({ children }) => <strong style={{ fontWeight: 600, color: '#111' }}>{children}</strong>,
          table: ({ children }) => <table style={{ width: '100%', borderCollapse: 'collapse', margin: '24px 0', fontSize: 14 }}>{children}</table>,
          th: ({ children }) => <th style={{ textAlign: 'left', padding: '8px 12px', borderBottom: '2px solid #e5e7eb', fontWeight: 600, color: '#111' }}>{children}</th>,
          td: ({ children }) => <td style={{ padding: '8px 12px', borderBottom: '1px solid #f3f4f6', color: '#374151' }}>{children}</td>,
        }}
      >
        {content}
      </ReactMarkdown>
    </div>
  )
}

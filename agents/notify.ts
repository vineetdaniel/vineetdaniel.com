/**
 * Notify — emails the daily auto-draft digest via Resend.
 *
 * Sends a "draft ready" digest on success (topic, provider, word count, tags,
 * excerpt, draft + publish links) or a failure alert with the workflow-run
 * link so you can see the logs.
 *
 * Needs:
 *   RESEND_API_KEY — from https://resend.com (free tier: 3,000 emails/mo)
 *   NOTIFY_TO      — recipient, default vineetdaniel@gmail.com
 *   SITE_API_URL   — base URL for the draft/admin links
 *
 * The sender defaults to Resend's onboarding address until you verify a
 * domain (set NOTIFY_FROM to override).
 */

export interface DigestSuccess {
  status: 'success'
  topic: string
  category: string
  title: string
  slug: string
  excerpt: string
  tags: string[]
  wordCount: number
  provider: string
  researched: boolean
}

export interface DigestFailure {
  status: 'failure'
  error: string
  runUrl?: string
}

export type Digest = DigestSuccess | DigestFailure

const RESEND_URL = 'https://api.resend.com/emails'

function escapeHtml(s: string): string {
  return s
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
}

function successHtml(d: DigestSuccess, base: string): { subject: string; text: string; html: string } {
  const draftUrl = `${base}/${d.slug}`
  const adminUrl = `${base}/admin`
  const subject = `Draft ready: ${d.title}`

  const text = [
    `Daily auto-draft is ready for review.`,
    ``,
    `Topic researched : ${d.topic}`,
    `Category         : ${d.category}`,
    `Title            : ${d.title}`,
    `Provider         : ${d.provider}${d.researched ? ' (live web research)' : ' (model knowledge only)'}`,
    `Length           : ~${d.wordCount} words`,
    `Tags             : ${d.tags.join(', ')}`,
    ``,
    `Excerpt: ${d.excerpt}`,
    ``,
    `Review the draft (not public yet): ${draftUrl}`,
    `Publish it from the admin panel: ${adminUrl}`,
  ].join('\n')

  const row = (k: string, v: string) =>
    `<tr><td style="padding:4px 16px 4px 0;color:#888;vertical-align:top;white-space:nowrap">${k}</td><td style="padding:4px 0">${v}</td></tr>`

  const html = `<!DOCTYPE html><html><body style="font-family:ui-sans-serif,system-ui,sans-serif;color:#1a1a1a;line-height:1.5;max-width:560px">
  <h2 style="margin:0 0 12px">Daily draft ready for review</h2>
  <table style="border-collapse:collapse;font-size:14px">
    ${row('Topic', escapeHtml(d.topic))}
    ${row('Category', escapeHtml(d.category))}
    ${row('Title', `<strong>${escapeHtml(d.title)}</strong>`)}
    ${row('Provider', `${escapeHtml(d.provider)}${d.researched ? ' (live web research)' : ' (model knowledge only)'}`)}
    ${row('Length', `~${d.wordCount} words`)}
    ${row('Tags', escapeHtml(d.tags.join(', ')))}
  </table>
  <p style="margin:16px 0 4px;color:#444"><em>${escapeHtml(d.excerpt)}</em></p>
  <p style="margin:20px 0">
    <a href="${draftUrl}" style="background:#111;color:#fff;padding:10px 16px;border-radius:6px;text-decoration:none;display:inline-block">Review draft</a>
    &nbsp;
    <a href="${adminUrl}" style="padding:10px 16px;border:1px solid #ccc;border-radius:6px;text-decoration:none;color:#111;display:inline-block">Open admin</a>
  </p>
  <p style="font-size:12px;color:#999">The draft is unpublished. Review and publish when you're happy with it.</p>
</body></html>`

  return { subject, text, html }
}

function failureHtml(d: DigestFailure): { subject: string; text: string; html: string } {
  const date = new Date().toISOString().slice(0, 10)
  const subject = `Daily draft FAILED — ${date}`

  const text = [
    `The daily auto-draft run failed.`,
    ``,
    `Error: ${d.error}`,
    d.runUrl ? `Workflow run: ${d.runUrl}` : undefined,
  ]
    .filter(Boolean)
    .join('\n')

  const html = `<!DOCTYPE html><html><body style="font-family:ui-sans-serif,system-ui,sans-serif;color:#1a1a1a;line-height:1.5;max-width:560px">
  <h2 style="margin:0 0 12px;color:#b91c1c">Daily auto-draft failed</h2>
  <pre style="background:#f6f6f6;padding:12px;border-radius:6px;white-space:pre-wrap;font-size:13px">${escapeHtml(d.error)}</pre>
  ${d.runUrl ? `<p><a href="${d.runUrl}" style="color:#2563eb">View the workflow run logs</a></p>` : ''}
</body></html>`

  return { subject, text, html }
}

/** Send the digest. Never throws — notification failure must not fail the job. */
export async function sendDigest(d: Digest): Promise<void> {
  const apiKey = process.env.RESEND_API_KEY
  if (!apiKey) {
    console.warn('   ⚠️  RESEND_API_KEY not set; skipping email notification')
    return
  }

  const to = process.env.NOTIFY_TO || 'vineetdaniel@gmail.com'
  const from = process.env.NOTIFY_FROM || 'Vineet Blog Bot <onboarding@resend.dev>'
  const base = (process.env.SITE_API_URL || 'https://www.vineetdaniel.com').replace(/\/$/, '')

  const msg = d.status === 'success' ? successHtml(d, base) : failureHtml(d)

  try {
    const res = await fetch(RESEND_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${apiKey}` },
      body: JSON.stringify({ from, to: [to], subject: msg.subject, text: msg.text, html: msg.html }),
    })
    if (!res.ok) {
      const text = await res.text()
      console.warn(`   ⚠️  Resend notification failed ${res.status}: ${text}`)
    } else {
      console.log(`   ✉️  Digest emailed to ${to}`)
    }
  } catch (err) {
    console.warn(`   ⚠️  Could not send notification: ${(err as Error).message}`)
  }
}

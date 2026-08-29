import { createHmac, timingSafeEqual } from 'node:crypto'
import { cookies } from 'next/headers'

export const ADMIN_COOKIE = 'admin_session'

export function requireApiKey(request: Request): boolean {
  const key = request.headers.get('x-api-key') ?? request.headers.get('authorization')?.replace('Bearer ', '')
  return key === process.env.API_SECRET
}

/** Signing secret for the admin session token. */
function signingSecret(): string {
  // Combine both secrets so the token can't be forged without server env.
  return `${process.env.API_SECRET ?? ''}:${process.env.ADMIN_PASSWORD ?? ''}`
}

/** Create a signed, stateless admin session token. */
export function createSessionToken(): string {
  const payload = 'admin'
  const sig = createHmac('sha256', signingSecret()).update(payload).digest('hex')
  return `${payload}.${sig}`
}

/** Validate a session token in constant time. */
export function verifySessionToken(token: string | undefined | null): boolean {
  if (!token) return false
  const [payload, sig] = token.split('.')
  if (payload !== 'admin' || !sig) return false
  const expected = createHmac('sha256', signingSecret()).update(payload).digest('hex')
  try {
    const a = Buffer.from(sig, 'hex')
    const b = Buffer.from(expected, 'hex')
    return a.length === b.length && timingSafeEqual(a, b)
  } catch {
    return false
  }
}

/** Constant-time password check against ADMIN_PASSWORD. */
export function checkAdminPassword(password: string): boolean {
  const expected = process.env.ADMIN_PASSWORD
  if (!expected) return false
  const a = Buffer.from(password)
  const b = Buffer.from(expected)
  return a.length === b.length && timingSafeEqual(a, b)
}

/** True if the current request carries a valid admin session cookie. */
export async function isAdmin(): Promise<boolean> {
  const store = await cookies()
  return verifySessionToken(store.get(ADMIN_COOKIE)?.value)
}

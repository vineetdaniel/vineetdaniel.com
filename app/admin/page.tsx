import type { Metadata } from 'next'
import { isAdmin } from '@/lib/auth'
import { AdminDashboard } from './AdminDashboard'
import { AdminLogin } from './AdminLogin'

export const metadata: Metadata = {
  title: 'Admin',
  robots: { index: false, follow: false },
}

// Admin state depends on the session cookie, so never cache this page.
export const dynamic = 'force-dynamic'

export default async function AdminPage() {
  const authed = await isAdmin()
  return authed ? <AdminDashboard /> : <AdminLogin />
}

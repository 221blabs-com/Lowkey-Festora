import type { Metadata } from 'next';
import { getAdmin } from '@/lib/server/admin-auth';
import { AdminLogin } from '@/components/admin/AdminLogin';
import { AdminDashboard } from '@/components/admin/AdminDashboard';

export const metadata: Metadata = { title: 'Festora Admin', robots: { index: false, follow: false } };
export const dynamic = 'force-dynamic';

/** Served at /admin.html (rewrite in next.config.ts) and /admin. */
export default async function AdminPage() {
  let admin: { u: string } | null = null;
  let configured = true;
  try {
    admin = await getAdmin();
  } catch {
    configured = false;
  }
  return admin ? <AdminDashboard username={admin.u} /> : <AdminLogin configured={configured} />;
}

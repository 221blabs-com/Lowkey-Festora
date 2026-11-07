import { getAdmin } from './admin-auth';
import { json } from './http';

export async function requireAdmin() {
  try {
    const admin = await getAdmin();
    return admin ? null : json({ error: 'Unauthorized' }, 401);
  } catch {
    return json({ error: 'Admin is not configured' }, 503);
  }
}

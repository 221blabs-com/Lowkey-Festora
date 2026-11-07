import { cert, getApps, initializeApp, type App } from 'firebase-admin/app';
import { getFirestore, type Firestore } from 'firebase-admin/firestore';
import { env } from './env';

/** Same credential shape festora-v1 uses (service-account fields as env vars). */
function normalizeKey(key: string) {
  return key.replace(/^"|"$/g, '').replace(/\\n/g, '\n');
}

let db: Firestore | null = null;

export function firestore(): Firestore {
  if (db) return db;
  const app: App =
    getApps()[0] ??
    initializeApp({
      credential: cert({
        projectId: env('FIREBASE_PROJECT_ID'),
        clientEmail: env('FIREBASE_CLIENT_EMAIL'),
        privateKey: normalizeKey(env('FIREBASE_PRIVATE_KEY')),
      }),
    });
  db = getFirestore(app);
  return db;
}

export const COLLECTION = () => process.env.FIRESTORE_COLLECTION?.trim() || 'lowkey_tech_2026_registrations';

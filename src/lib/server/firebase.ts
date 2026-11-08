import { cert, getApps, initializeApp, type App } from 'firebase-admin/app';
import { getFirestore, type Firestore } from 'firebase-admin/firestore';
import { env, optionalEnv } from './env';

/** Same credential shape festora-v1 uses (service-account fields as env vars). */
function normalizeKey(key: string) {
  return key.replace(/^"|"$/g, '').replace(/\\n/g, '\n');
}

/**
 * FIREBASE_PRIVATE_KEY_BASE64 (preferred) avoids the quote/newline-escaping
 * that regularly gets mangled pasting a PEM key into a dashboard text field.
 * Falls back to the raw FIREBASE_PRIVATE_KEY for compatibility.
 */
function resolvePrivateKey(): string {
  const b64 = optionalEnv('FIREBASE_PRIVATE_KEY_BASE64');
  if (b64) return Buffer.from(b64, 'base64').toString('utf8');
  return normalizeKey(env('FIREBASE_PRIVATE_KEY'));
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
        privateKey: resolvePrivateKey(),
      }),
    });
  db = getFirestore(app);
  return db;
}

export const COLLECTION = () => process.env.FIRESTORE_COLLECTION?.trim() || 'lowkey_tech_2026_registrations';

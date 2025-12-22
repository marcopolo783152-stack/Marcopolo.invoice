// Firebase Admin SDK config for server-side (API routes, SSR)
// Replace the placeholder values with your Firebase service account config
import { initializeApp, cert, getApps, getApp } from 'firebase-admin/app';
import { getFirestore } from 'firebase-admin/firestore';

const serviceAccount = {
  projectId: process.env.FIREBASE_PROJECT_ID,
  clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
  privateKey: process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, '\n'),
};

const adminApp = !getApps().length ? initializeApp({
  credential: cert(serviceAccount as any),
}) : getApp();

export const adminDb = getFirestore(adminApp);

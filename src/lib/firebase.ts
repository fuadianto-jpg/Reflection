import { initializeApp, type FirebaseApp } from "firebase/app";
import { getFirestore, type Firestore } from "firebase/firestore";
import { getAuth, type Auth } from "firebase/auth";

const config = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY as string | undefined,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN as string | undefined,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID as string | undefined,
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET as string | undefined,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID as
    | string
    | undefined,
  appId: import.meta.env.VITE_FIREBASE_APP_ID as string | undefined,
};

/**
 * Firebase is active only when the core config is present. Otherwise the app
 * runs in local demo mode (data in browser localStorage).
 */
export const isFirebaseConfigured = !!(config.apiKey && config.projectId);

const app: FirebaseApp | null = isFirebaseConfigured
  ? initializeApp(config as Record<string, string>)
  : null;

export const db: Firestore | null = app ? getFirestore(app) : null;
export const auth: Auth | null = app ? getAuth(app) : null;

export const APPS_COLLECTION = "apps";

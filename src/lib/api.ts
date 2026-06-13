import {
  collection,
  getDocs,
  addDoc,
  updateDoc,
  deleteDoc,
  doc,
} from "firebase/firestore";
import {
  signInWithEmailAndPassword,
  signOut as fbSignOut,
  onAuthStateChanged,
} from "firebase/auth";
import { db, auth, isFirebaseConfigured, APPS_COLLECTION } from "./firebase";
import { DEMO_APPS } from "../data/demo";
import type { AppInput, BookApp } from "../types";

const LS_APPS = "hub_demo_apps";
const LS_AUTH = "hub_demo_auth";

/* ----------------------------- demo storage ----------------------------- */

function demoRead(): BookApp[] {
  try {
    const raw = localStorage.getItem(LS_APPS);
    if (raw) return JSON.parse(raw) as BookApp[];
  } catch {
    /* ignore */
  }
  localStorage.setItem(LS_APPS, JSON.stringify(DEMO_APPS));
  return [...DEMO_APPS];
}

function demoWrite(apps: BookApp[]) {
  localStorage.setItem(LS_APPS, JSON.stringify(apps));
}

const byOrder = (a: BookApp, b: BookApp) =>
  a.sort_order - b.sort_order ||
  (a.created_at ?? "").localeCompare(b.created_at ?? "");

/* ------------------------------- apps CRUD ------------------------------- */

/** Public gallery: published only. Admin: pass includeAll=true. */
export async function listApps(includeAll = false): Promise<BookApp[]> {
  if (!isFirebaseConfigured) {
    const apps = demoRead().sort(byOrder);
    return includeAll ? apps : apps.filter((a) => a.status === "published");
  }
  const snap = await getDocs(collection(db!, APPS_COLLECTION));
  let apps = snap.docs.map((d) => ({ id: d.id, ...d.data() })) as BookApp[];
  apps = apps.sort(byOrder);
  return includeAll ? apps : apps.filter((a) => a.status === "published");
}

export async function createApp(input: AppInput): Promise<void> {
  const now = new Date().toISOString();
  if (!isFirebaseConfigured) {
    const apps = demoRead();
    demoWrite([
      ...apps,
      { ...input, id: crypto.randomUUID(), created_at: now, updated_at: now },
    ]);
    return;
  }
  await addDoc(collection(db!, APPS_COLLECTION), {
    ...input,
    created_at: now,
    updated_at: now,
  });
}

export async function updateApp(
  id: string,
  input: Partial<AppInput>
): Promise<void> {
  const updated_at = new Date().toISOString();
  if (!isFirebaseConfigured) {
    const apps = demoRead().map((a) =>
      a.id === id ? { ...a, ...input, updated_at } : a
    );
    demoWrite(apps);
    return;
  }
  await updateDoc(doc(db!, APPS_COLLECTION, id), { ...input, updated_at });
}

export async function deleteApp(id: string): Promise<void> {
  if (!isFirebaseConfigured) {
    demoWrite(demoRead().filter((a) => a.id !== id));
    return;
  }
  await deleteDoc(doc(db!, APPS_COLLECTION, id));
}

/* ------------------------------ cover upload ----------------------------- */

/**
 * Cover is normally auto-generated (SVG data URL). For manual uploads we also
 * store a data URL directly — no separate storage service needed.
 */
export async function uploadCover(file: File): Promise<string> {
  return await fileToDataUrl(file);
}

function fileToDataUrl(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
}

/* --------------------------------- auth ---------------------------------- */

export function getLoggedIn(): Promise<boolean> {
  if (!isFirebaseConfigured) {
    return Promise.resolve(localStorage.getItem(LS_AUTH) === "1");
  }
  return new Promise((resolve) => {
    const unsub = onAuthStateChanged(auth!, (user) => {
      unsub();
      resolve(!!user);
    });
  });
}

export async function signIn(email: string, password: string): Promise<void> {
  if (!isFirebaseConfigured) {
    if (!email || !password) throw new Error("Isi email dan password.");
    localStorage.setItem(LS_AUTH, "1");
    return;
  }
  await signInWithEmailAndPassword(auth!, email, password);
}

export async function signOut(): Promise<void> {
  if (!isFirebaseConfigured) {
    localStorage.removeItem(LS_AUTH);
    return;
  }
  await fbSignOut(auth!);
}

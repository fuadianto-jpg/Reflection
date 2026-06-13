import { supabase, isSupabaseConfigured, COVERS_BUCKET } from "./supabase";
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
  a.sort_order - b.sort_order || (a.created_at ?? "").localeCompare(b.created_at ?? "");

/* ------------------------------- apps CRUD ------------------------------- */

/** Public gallery: published only. Admin: pass includeAll=true. */
export async function listApps(includeAll = false): Promise<BookApp[]> {
  if (!isSupabaseConfigured) {
    const apps = demoRead().sort(byOrder);
    return includeAll ? apps : apps.filter((a) => a.status === "published");
  }
  let query = supabase!.from("apps").select("*").order("sort_order", { ascending: true });
  if (!includeAll) query = query.eq("status", "published");
  const { data, error } = await query;
  if (error) throw error;
  return (data as BookApp[]) ?? [];
}

export async function createApp(input: AppInput): Promise<BookApp> {
  if (!isSupabaseConfigured) {
    const apps = demoRead();
    const app: BookApp = {
      ...input,
      id: crypto.randomUUID(),
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };
    demoWrite([...apps, app]);
    return app;
  }
  const { data, error } = await supabase!.from("apps").insert(input).select().single();
  if (error) throw error;
  return data as BookApp;
}

export async function updateApp(id: string, input: Partial<AppInput>): Promise<void> {
  if (!isSupabaseConfigured) {
    const apps = demoRead().map((a) =>
      a.id === id ? { ...a, ...input, updated_at: new Date().toISOString() } : a
    );
    demoWrite(apps);
    return;
  }
  const { error } = await supabase!
    .from("apps")
    .update({ ...input, updated_at: new Date().toISOString() })
    .eq("id", id);
  if (error) throw error;
}

export async function deleteApp(id: string): Promise<void> {
  if (!isSupabaseConfigured) {
    demoWrite(demoRead().filter((a) => a.id !== id));
    return;
  }
  const { error } = await supabase!.from("apps").delete().eq("id", id);
  if (error) throw error;
}

/* ------------------------------ cover upload ----------------------------- */

/** Returns a public URL (Supabase) or a base64 data URL (demo). */
export async function uploadCover(file: File): Promise<string> {
  if (!isSupabaseConfigured) {
    return await fileToDataUrl(file);
  }
  const ext = file.name.split(".").pop() ?? "jpg";
  const path = `${crypto.randomUUID()}.${ext}`;
  const { error } = await supabase!.storage.from(COVERS_BUCKET).upload(path, file, {
    cacheControl: "3600",
    upsert: false,
  });
  if (error) throw error;
  const { data } = supabase!.storage.from(COVERS_BUCKET).getPublicUrl(path);
  return data.publicUrl;
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

export async function getLoggedIn(): Promise<boolean> {
  if (!isSupabaseConfigured) return localStorage.getItem(LS_AUTH) === "1";
  const { data } = await supabase!.auth.getSession();
  return !!data.session;
}

export async function signIn(email: string, password: string): Promise<void> {
  if (!isSupabaseConfigured) {
    if (!email || !password) throw new Error("Isi email dan password.");
    localStorage.setItem(LS_AUTH, "1");
    return;
  }
  const { error } = await supabase!.auth.signInWithPassword({ email, password });
  if (error) throw error;
}

export async function signOut(): Promise<void> {
  if (!isSupabaseConfigured) {
    localStorage.removeItem(LS_AUTH);
    return;
  }
  await supabase!.auth.signOut();
}

import { createClient, type SupabaseClient } from "@supabase/supabase-js";

const url = import.meta.env.VITE_SUPABASE_URL as string | undefined;
const anonKey = import.meta.env.VITE_SUPABASE_ANON_KEY as string | undefined;

const isValidUrl = (v?: string) => !!v && /^https?:\/\//.test(v);

/**
 * Supabase client. Null when env vars are not configured yet —
 * the app then falls back to local demo data so it always runs.
 */
export const supabase: SupabaseClient | null =
  isValidUrl(url) && anonKey ? createClient(url!, anonKey!) : null;

export const isSupabaseConfigured = supabase !== null;

export const COVERS_BUCKET = "covers";

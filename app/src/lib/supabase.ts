/**
 * Server-side Supabase client for API routes.
 *
 * Prefers the service-role key; falls back to the publishable key (RLS then
 * applies, so tables need a public read policy). The key is never exposed to
 * the browser. Reads go through PostgREST; the pipeline remains the only writer.
 */
import { createClient, type SupabaseClient } from "@supabase/supabase-js";

let client: SupabaseClient | null = null;

function supabaseKey(): string | undefined {
  return (
    process.env.SUPABASE_SERVICE_ROLE_KEY ||
    process.env.SUPABASE_PUBLISHABLE_KEY ||
    process.env.SUPABASE_ANON_KEY
  );
}

/** Shared env resolution: URL + public key (publishable or legacy anon name). */
export function supabaseEnv(): { url: string; key: string } | null {
  const url = process.env.SUPABASE_URL;
  const key = supabaseKey();
  if (!url || !key) return null;
  return { url, key };
}

export function supabaseEnabled(): boolean {
  return Boolean(process.env.SUPABASE_URL && supabaseKey());
}

export function getSupabase(): SupabaseClient {
  const url = process.env.SUPABASE_URL;
  const key = supabaseKey();
  if (!url || !key) {
    throw new Error(
      "Supabase is not configured: set SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY (or SUPABASE_PUBLISHABLE_KEY)"
    );
  }
  if (!client) {
    client = createClient(url, key, { auth: { persistSession: false } });
  }
  return client;
}

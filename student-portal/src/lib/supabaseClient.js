// Proprietary - Student Project Tracker FYP - Unauthorized copying prohibited
import { createClient } from "@supabase/supabase-js";

let client;

export function getSupabaseClient() {
  if (client) return client;

  const url =
    import.meta.env.VITE_SUPABASE_URL ||
    "https://trcbyhouobuomteokyrk.supabase.co";
  const anonKey =
    import.meta.env.VITE_SUPABASE_ANON_KEY ||
    "sb_publishable_HYSOE4b8CcDXFqnGfxwMnw_4Q1OABKW";

  client = createClient(url, anonKey);
  return client;
}

export function subscribeToTable(table, onChange, filter) {
  const supabase = getSupabaseClient();
  const channel = supabase
    .channel(`realtime:${table}:${filter || "all"}:${crypto.randomUUID()}`)
    .on(
      "postgres_changes",
      { event: "*", schema: "public", table, ...(filter ? { filter } : {}) },
      onChange
    )
    .subscribe((status, error) => {
      if (error) console.error(`Realtime subscription failed for ${table}:`, error);
      if (status === "CHANNEL_ERROR" || status === "TIMED_OUT") {
        console.error(`Realtime subscription for ${table} ended with status ${status}.`);
      }
    });

  return () => {
    supabase.removeChannel(channel);
  };
}

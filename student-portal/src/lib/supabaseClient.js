import { createClient } from "@supabase/supabase-js";

let client;

export function getSupabaseClient() {
  if (client) return client;

  const url = import.meta.env.VITE_SUPABASE_URL;
  const anonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;
  if (!url || !anonKey) {
    throw new Error("Set VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY in .env.");
  }

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


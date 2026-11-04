import { createClient, type SupabaseClient } from "@supabase/supabase-js";

export type EventRecord = {
  id: string;
  title: string;
  starts_at: string;
  location: string | null;
  description: string | null;
  is_published: boolean;
  created_at: string;
};

type EventInsert = Omit<EventRecord, "id" | "created_at">;

type Database = {
  public: {
    Tables: {
      events: {
        Row: EventRecord;
        Insert: EventInsert;
        Update: Partial<EventInsert>;
        Relationships: [];
      };
      event_admins: {
        Row: { user_id: string; created_at: string };
        Insert: { user_id: string };
        Update: never;
        Relationships: [];
      };
    };
    Views: Record<string, never>;
    Functions: Record<string, never>;
    Enums: Record<string, never>;
    CompositeTypes: Record<string, never>;
  };
};

let supabaseClient: SupabaseClient<Database> | null = null;

export function isSupabaseConfigured(): boolean {
  return Boolean(
    process.env.NEXT_PUBLIC_SUPABASE_URL &&
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
  );
}

export function getSupabaseClient(): SupabaseClient<Database> | null {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  if (!isSupabaseConfigured() || !url || !anonKey) return null;

  supabaseClient ??= createClient<Database>(url, anonKey);
  return supabaseClient;
}

export function formatEventDate(value: string): string {
  return new Intl.DateTimeFormat("cs-CZ", {
    weekday: "long",
    day: "numeric",
    month: "long",
    year: "numeric",
  }).format(new Date(value));
}

export function formatEventTime(value: string): string {
  return new Intl.DateTimeFormat("cs-CZ", {
    hour: "2-digit",
    minute: "2-digit",
  }).format(new Date(value));
}

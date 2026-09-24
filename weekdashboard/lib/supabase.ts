import { createClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

function isValidSupabaseUrl(value: string | undefined) {
  if (!value) return false;

  try {
    const url = new URL(value);
    return url.protocol === "https:" || url.protocol === "http:";
  } catch {
    return false;
  }
}

const validSupabaseUrl =
  supabaseUrl && isValidSupabaseUrl(supabaseUrl) ? supabaseUrl : null;

export const supabase =
  validSupabaseUrl && supabaseAnonKey
    ? createClient(validSupabaseUrl, supabaseAnonKey)
    : null;

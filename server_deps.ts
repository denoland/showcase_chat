import "https://deno.land/std@0.134.0/dotenv/load.ts";
export * from "https://raw.githubusercontent.com/lucacasonato/fresh/main/server.ts";
export {
  getCookies,
  setCookie,
} from "https://deno.land/std@0.134.0/http/cookie.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js";

export const supabase = createClient(
  "https://bbmzbbmtwmdaecpqtjln.supabase.co",
  Deno.env.get("SUPABASE_ANON_KEY"),
);

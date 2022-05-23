import "https://deno.land/std@0.134.0/dotenv/load.ts";
export * from "https://raw.githubusercontent.com/lucacasonato/fresh/ec388f87fb19cf5c247ad62c9a0beb771170da07/server.ts";
export { virtualSheet } from "https://esm.sh/twind@0.16.16/sheets";
export {
  deleteCookie,
  getCookies,
  setCookie,
} from "https://deno.land/std@0.134.0/http/cookie.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js";
export { emojify } from "https://esm.sh/@twuni/emojify";

export const supabase = createClient(
  Deno.env.get("SUPABASE_API_URL")!,
  Deno.env.get("SUPABASE_ANON_KEY")!,
);

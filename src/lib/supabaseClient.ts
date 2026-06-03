import { createClient } from "@supabase/supabase-js";

// Clean up URL in case it ends with '/rest/v1/'
const rawUrl = (import.meta as any).env.VITE_SUPABASE_URL || "https://sasroebskiajgufstqnm.supabase.co/rest/v1/";
const supabaseUrl = rawUrl.replace(/\/rest\/v1\/?$/, "");
const supabaseAnonKey = (import.meta as any).env.VITE_SUPABASE_ANON_KEY || "sb_publishable_7-Kl_ciiAMm1JEXL118blw_anbF2wfi";

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

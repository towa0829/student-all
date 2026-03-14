import { createBrowserClient } from "@supabase/ssr";

import { getSupabaseConfig } from "@/lib/supabase-config";
import type { Database } from "@/types/supabase";

export function createSupabaseBrowserClient() {
  const { supabaseAnonKey, supabaseUrl } = getSupabaseConfig();

  return createBrowserClient<Database>(supabaseUrl, supabaseAnonKey);
}

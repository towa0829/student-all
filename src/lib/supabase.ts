import { createSupabaseBrowserClient } from "@/lib/supabase-browser";

export const supabase = createSupabaseBrowserClient();

export { createSupabaseBrowserClient } from "@/lib/supabase-browser";
export { createSupabaseServerClient } from "@/lib/supabase-server";
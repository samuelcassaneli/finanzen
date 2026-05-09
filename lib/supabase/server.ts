import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";
import { createClient as createAdminClient, type SupabaseClient } from "@supabase/supabase-js";
import type { ResponseCookies } from "next/dist/server/web/spec-extension/cookies";
import type { Database } from "@/lib/supabase/types";

type CookieEntry = {
  name: string;
  value: string;
  options?: Parameters<ResponseCookies["set"]>[2];
};

export function createClient(): SupabaseClient<Database> {
  const cookieStore = cookies();
  return createServerClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll: () => cookieStore.getAll(),
        setAll: (toSet: CookieEntry[]) => {
          try {
            toSet.forEach(({ name, value, options }) => cookieStore.set(name, value, options));
          } catch {
            // called from a Server Component — ignore (middleware refreshes the session).
          }
        },
      },
    },
  ) as unknown as SupabaseClient<Database>;
}

export function createServiceRoleClient(): SupabaseClient<Database> {
  return createAdminClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    { auth: { persistSession: false, autoRefreshToken: false } },
  );
}

import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";

/**
 * Supabase client for use in Server Components, Server Actions, and
 * Route Handlers. Reads/writes auth cookies via Next.js's cookies()
 * API (async in this Next.js version — must be awaited).
 *
 * Security note: always verify identity server-side with
 * supabase.auth.getClaims() (validates the JWT signature), never trust
 * supabase.auth.getSession() alone for authorization decisions — the
 * session is read from storage and isn't re-verified.
 */
export async function createClient() {
  const cookieStore = await cookies();

  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return cookieStore.getAll();
        },
        setAll(cookiesToSet) {
          try {
            cookiesToSet.forEach(({ name, value, options }) =>
              cookieStore.set(name, value, options)
            );
          } catch {
            // Called from a Server Component, which can't write cookies.
            // Safe to ignore here because the proxy (src/proxy.ts) is
            // responsible for refreshing and writing the session cookie.
          }
        },
      },
    }
  );
}

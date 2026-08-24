import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";

/**
 * Refreshes the Supabase auth session on every matched request and
 * keeps cookies in sync between the browser and Server Components.
 * Called from src/proxy.ts (Next.js renamed "middleware" to "proxy" in
 * this version — confirmed against the framework's own bundled docs,
 * not assumed).
 *
 * Uses getClaims() (not getUser() or getSession()) to verify the
 * session — getClaims() validates the JWT signature locally/against
 * the project's published keys, which is the current Supabase-
 * recommended way to protect pages and data server-side.
 */
export async function updateSession(request: NextRequest) {
  let response = NextResponse.next({ request });

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value }) => request.cookies.set(name, value));
          response = NextResponse.next({ request });
          cookiesToSet.forEach(({ name, value, options }) =>
            response.cookies.set(name, value, options)
          );
        },
      },
    }
  );

  // Refreshes the token if needed and syncs cookies both ways.
  await supabase.auth.getClaims();

  return response;
}

import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

/**
 * Password-reset callback. Separate from /auth/callback on purpose:
 * the reset flow's redirectTo must match a Redirect URL in Supabase
 * exactly, and the old flow used
 * /auth/callback?next=/reset-password — that URL (with the query
 * string) was NOT in the Redirect URLs list, so Supabase ignored
 * the redirectTo and the reset link landed on the homepage instead
 * of the reset page. This route has no query string, so it can be
 * allow-listed exactly, and it always lands on /reset-password.
 */
export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url);
  const code = searchParams.get("code");

  if (code) {
    const supabase = await createClient();
    const { error } = await supabase.auth.exchangeCodeForSession(code);
    if (!error) {
      return NextResponse.redirect(`${origin}/reset-password`);
    }
  }

  return NextResponse.redirect(`${origin}/login?error=auth_failed`);
}

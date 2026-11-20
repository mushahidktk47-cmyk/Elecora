import { Navbar } from "@/components/shared/navbar";
import { Footer } from "@/components/shared/footer";
import { createClient } from "@/lib/supabase/server";

/**
 * Shared page chrome (Navbar + Footer) used by both the (marketing) and
 * (dashboard) route groups. Extracted so both layouts stay in sync
 * automatically — a future change to the navbar/footer only needs to
 * happen in one place.
 *
 * If the dashboard area later needs different chrome entirely (e.g. a
 * sidebar instead of a top navbar), (dashboard)/layout.tsx can stop
 * using this and build its own — this is a starting point, not a
 * permanent coupling.
 *
 * Auth state for the navbar is decided HERE, on the server, from the
 * session cookies — not in the browser. The first version let the
 * navbar check auth itself in the browser after mount, and it kept
 * showing "Log in / Sign up" after a successful login, because the
 * client navigation after login did not re-run that check. Now the
 * server re-checks on every render (including router.refresh() after
 * login), and the navbar gets the answer as a prop.
 */
export async function SiteLayout({ children }: { children: React.ReactNode }) {
  const supabase = await createClient();
  const { data: claims } = await supabase.auth.getClaims();

  return (
    <div className="flex min-h-screen flex-col">
      <Navbar isSignedIn={Boolean(claims)} />
      <main className="flex-1">{children}</main>
      <Footer />
    </div>
  );
}

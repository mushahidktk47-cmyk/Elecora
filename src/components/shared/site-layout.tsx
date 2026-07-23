import { Navbar } from "@/components/shared/navbar";
import { Footer } from "@/components/shared/footer";

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
 */
export function SiteLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex min-h-screen flex-col">
      <Navbar />
      <main className="flex-1">{children}</main>
      <Footer />
    </div>
  );
}

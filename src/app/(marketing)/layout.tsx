import { SiteLayout } from "@/components/shared/site-layout";

/**
 * Layout for all public-facing pages (the "(marketing)" route group).
 * Uses the shared SiteLayout (Navbar + Footer) — see
 * src/components/shared/site-layout.tsx.
 */
export default function MarketingLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return <SiteLayout>{children}</SiteLayout>;
}

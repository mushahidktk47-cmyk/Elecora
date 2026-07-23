import { SiteLayout } from "@/components/shared/site-layout";

/**
 * Layout for the "(auth)" route group — login, signup. Same fix as
 * (dashboard)/layout.tsx: this route group had no layout at all, so
 * pages here inherited only the root layout (fonts/theme setup, no
 * visible navbar) — no way back to the homepage and no theme toggle.
 */
export default function AuthLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return <SiteLayout>{children}</SiteLayout>;
}

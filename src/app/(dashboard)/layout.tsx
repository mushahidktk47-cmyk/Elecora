import { SiteLayout } from "@/components/shared/site-layout";

/**
 * Layout for the "(dashboard)" route group — calculators, learn,
 * quizzes, tutor, saved. Previously this route group had no layout at
 * all, so pages here only inherited the root layout (fonts/theme setup
 * only) with no visible navbar — meaning no way back to the homepage
 * and no theme toggle. Fixed by using the same shared SiteLayout as
 * the marketing pages.
 *
 * If a sidebar-style dashboard layout is wanted later, this file is
 * where that change would happen — it wouldn't affect the marketing
 * pages, since they're a separate route group with their own layout.
 */
export default function DashboardLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return <SiteLayout>{children}</SiteLayout>;
}

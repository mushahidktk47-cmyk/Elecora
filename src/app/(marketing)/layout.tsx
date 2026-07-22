import { Navbar } from "@/components/shared/navbar";
import { Footer } from "@/components/shared/footer";

/**
 * Layout for all public-facing pages (the "(marketing)" route group).
 * Deliberately kept separate from the root layout so the future
 * dashboard area can use different chrome (e.g. a sidebar) without
 * inheriting this navbar/footer.
 */
export default function MarketingLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <div className="flex min-h-screen flex-col">
      <Navbar />
      <main className="flex-1">{children}</main>
      <Footer />
    </div>
  );
}

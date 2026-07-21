import type { Metadata } from "next";
import "./globals.css";

// Typography is a deliberate design decision made in Phase 2 (Design System),
// not the scaffolding phase. Using the system font stack for now via
// Tailwind's default `font-sans`/`font-mono` rather than committing to a
// specific Google Font here.

export const metadata: Metadata = {
  title: "Elecora",
  description: "AI-powered electrical engineering platform for students and engineers.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="h-full antialiased">
      <body className="min-h-full flex flex-col">{children}</body>
    </html>
  );
}

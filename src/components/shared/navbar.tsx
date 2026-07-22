"use client";

import Link from "next/link";
import { useState } from "react";
import { Menu, X, Zap } from "lucide-react";
import { Button, buttonVariants } from "@/components/ui/button";
import { ThemeToggle } from "@/components/shared/theme-toggle";
import { Container } from "@/components/marketing/container";
import { cn } from "@/lib/utils";

const navLinks = [
  { label: "Calculators", href: "/calculators" },
  { label: "Learn", href: "/learn" },
  { label: "Quizzes", href: "/quizzes" },
  { label: "AI Tutor", href: "/tutor" },
];

/**
 * Public site navbar. The mobile menu is a plain collapsible panel
 * (useState + aria-expanded) rather than a Dialog/Sheet component —
 * kept dependency-free since a full modal isn't needed for a simple
 * link list. Revisit if the mobile nav grows more complex.
 */
export function Navbar() {
  const [mobileOpen, setMobileOpen] = useState(false);

  return (
    <header className="sticky top-0 z-40 border-b border-border bg-background/95 backdrop-blur supports-backdrop-filter:bg-background/80">
      <Container className="flex h-16 items-center justify-between">
        <Link href="/" className="flex items-center gap-2 font-semibold tracking-tight">
          <Zap className="size-5 text-primary" aria-hidden="true" />
          Elecora
        </Link>

        <nav className="hidden items-center gap-6 md:flex" aria-label="Main">
          {navLinks.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className="text-sm font-medium text-muted-foreground transition-colors hover:text-foreground"
            >
              {link.label}
            </Link>
          ))}
        </nav>

        <div className="hidden items-center gap-2 md:flex">
          <ThemeToggle />
          <Link href="/login" className={cn(buttonVariants({ variant: "ghost", size: "sm" }))}>
            Log in
          </Link>
          <Link href="/signup" className={cn(buttonVariants({ size: "sm" }))}>
            Sign up
          </Link>
        </div>

        <div className="flex items-center gap-1 md:hidden">
          <ThemeToggle />
          <Button
            variant="ghost"
            size="icon"
            aria-label={mobileOpen ? "Close menu" : "Open menu"}
            aria-expanded={mobileOpen}
            aria-controls="mobile-nav"
            onClick={() => setMobileOpen((open) => !open)}
          >
            {mobileOpen ? <X /> : <Menu />}
          </Button>
        </div>
      </Container>

      {mobileOpen ? (
        <nav id="mobile-nav" aria-label="Mobile" className="border-t border-border md:hidden">
          <Container className="flex flex-col gap-1 py-3">
            {navLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className="rounded-md px-2 py-2 text-sm font-medium text-muted-foreground hover:bg-muted hover:text-foreground"
                onClick={() => setMobileOpen(false)}
              >
                {link.label}
              </Link>
            ))}
            <div className="mt-2 flex flex-col gap-2 border-t border-border pt-3">
              <Link
                href="/login"
                className={cn(buttonVariants({ variant: "outline" }))}
                onClick={() => setMobileOpen(false)}
              >
                Log in
              </Link>
              <Link
                href="/signup"
                className={cn(buttonVariants({}))}
                onClick={() => setMobileOpen(false)}
              >
                Sign up
              </Link>
            </div>
          </Container>
        </nav>
      ) : null}
    </header>
  );
}

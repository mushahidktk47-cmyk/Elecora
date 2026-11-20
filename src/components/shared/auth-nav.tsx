"use client";

import { useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Button, buttonVariants } from "@/components/ui/button";
import { createClient } from "@/lib/supabase/client";
import { signOut } from "@/lib/supabase/auth-actions";
import { cn } from "@/lib/utils";

/**
 * Signed-in / signed-out controls for the navbar.
 *
 * The signed-in answer comes from the server (SiteLayout reads the
 * session cookies and passes isSignedIn down). The first version let
 * this component check auth itself in the browser after mount, and
 * it kept showing "Log in / Sign up" after a successful login,
 * because the client navigation after login did not re-run that
 * check. Now the server re-checks on every render — including
 * router.refresh() after login — and this component renders the
 * prop directly. The auth subscription below only asks the server
 * to re-render when the session changes in this tab.
 *
 * "My Calculations" is here (not just in the nav links) because
 * /saved had no link anywhere in the navbar before — the only way
 * to reach it was after saving, or from /blocks.
 */
export function AuthNav({
  isSignedIn,
  onNavigate,
}: {
  isSignedIn: boolean;
  onNavigate?: () => void;
}) {
  const router = useRouter();

  useEffect(() => {
    const supabase = createClient();
    const { data: listener } = supabase.auth.onAuthStateChange(() => {
      router.refresh();
    });
    return () => listener.subscription.unsubscribe();
  }, [router]);

  if (isSignedIn) {
    return (
      <>
        <Link
          href="/saved"
          onClick={onNavigate}
          className={cn(buttonVariants({ variant: "ghost", size: "sm" }))}
        >
          My Calculations
        </Link>
        <form action={signOut}>
          <Button type="submit" variant="outline" size="sm">
            Sign out
          </Button>
        </form>
      </>
    );
  }

  return (
    <>
      <Link
        href="/login"
        onClick={onNavigate}
        className={cn(buttonVariants({ variant: "ghost", size: "sm" }))}
      >
        Log in
      </Link>
      <Link
        href="/signup"
        onClick={onNavigate}
        className={cn(buttonVariants({ size: "sm" }))}
      >
        Sign up
      </Link>
    </>
  );
}

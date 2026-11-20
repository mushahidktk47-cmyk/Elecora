"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Button, buttonVariants } from "@/components/ui/button";
import { createClient } from "@/lib/supabase/client";
import { signOut } from "@/lib/supabase/auth-actions";
import { cn } from "@/lib/utils";

/**
 * Signed-in / signed-out controls for the navbar. The navbar itself
 * is a client component, but it cannot know the auth state on first
 * render — the session lives in cookies the browser client reads
 * after mount, so this checks getUser() once and subscribes to
 * auth changes. While it is still checking, it renders nothing, so
 * a signed-in user never briefly sees "Log in / Sign up".
 *
 * "My Calculations" is here (not just in the nav links) because
 * /saved had no link anywhere in the navbar before — the only way
 * to reach it was after saving, or from /blocks.
 */
export function AuthNav({ onNavigate }: { onNavigate?: () => void }) {
  const [state, setState] = useState<"checking" | "signed-in" | "signed-out">("checking");

  useEffect(() => {
    const supabase = createClient();
    supabase.auth.getUser().then(({ data }) => {
      setState(data.user ? "signed-in" : "signed-out");
    });
    const { data: listener } = supabase.auth.onAuthStateChange((_event, session) => {
      setState(session ? "signed-in" : "signed-out");
    });
    return () => listener.subscription.unsubscribe();
  }, []);

  if (state === "checking") return null;

  if (state === "signed-in") {
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

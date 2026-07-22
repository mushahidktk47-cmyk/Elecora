"use client";

import { useEffect, useState } from "react";
import { Moon, Sun } from "lucide-react";
import { useTheme } from "next-themes";
import { Button } from "@/components/ui/button";

/**
 * Toggles between light and dark mode. Persists the user's choice via
 * next-themes (localStorage under the hood). Falls back to system
 * preference until the user makes an explicit choice.
 *
 * We wait for `mounted` before rendering the real icon because the
 * server doesn't know the user's theme yet — rendering a neutral
 * placeholder first avoids a light/dark mismatch flash.
 */
export function ThemeToggle() {
  const { resolvedTheme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    // This is the documented next-themes pattern for avoiding a light/dark
    // flash on first render — we're just detecting we've reached the
    // client, not synchronizing with an external system.
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setMounted(true);
  }, []);

  if (!mounted) {
    return (
      <Button variant="ghost" size="icon" aria-label="Toggle theme" disabled>
        <Sun className="scale-0" />
      </Button>
    );
  }

  const isDark = resolvedTheme === "dark";

  return (
    <Button
      variant="ghost"
      size="icon"
      aria-label={isDark ? "Switch to light mode" : "Switch to dark mode"}
      onClick={() => setTheme(isDark ? "light" : "dark")}
    >
      {isDark ? <Sun /> : <Moon />}
    </Button>
  );
}

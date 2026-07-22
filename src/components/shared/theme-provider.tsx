"use client";

import { ThemeProvider as NextThemesProvider } from "next-themes";
import type { ComponentProps } from "react";

/**
 * Wraps next-themes so the rest of the app can toggle light/dark mode.
 * Defaults to the user's system preference, persists their explicit
 * choice (if any) in localStorage, and applies it by toggling a "dark"
 * class on <html> (see the `@custom-variant dark` rule in globals.css).
 */
export function ThemeProvider({
  children,
  ...props
}: ComponentProps<typeof NextThemesProvider>) {
  return (
    <NextThemesProvider
      attribute="class"
      defaultTheme="system"
      enableSystem
      disableTransitionOnChange
      {...props}
    >
      {children}
    </NextThemesProvider>
  );
}

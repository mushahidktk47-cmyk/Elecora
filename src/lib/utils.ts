import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

/**
 * Merges class names intelligently, resolving Tailwind conflicts
 * (e.g. cn("p-2", "p-4") => "p-4" instead of both being applied).
 * Used by every shadcn/ui component and safe to use in your own components too.
 */
export function cn(...inputs: ClassValue[]): string {
  return twMerge(clsx(inputs));
}

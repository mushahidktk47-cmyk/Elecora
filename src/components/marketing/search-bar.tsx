"use client";

import { useId, useMemo, useRef, useState } from "react";
import Link from "next/link";
import { Search } from "lucide-react";
import { Input } from "@/components/ui/input";
import { calculatorRegistry } from "@/calculations/registry";
import { cn } from "@/lib/utils";

interface SearchBarProps {
  className?: string;
}

/**
 * Live client-side search over the real calculator registry — name and
 * description substring match, no backend/API call needed at this
 * scale. Shows an accessible, keyboard-navigable results dropdown.
 * Scoped to calculators only for now; Reference/Learn content will
 * extend this once those systems exist, not before.
 */
export function SearchBar({ className }: SearchBarProps) {
  const [query, setQuery] = useState("");
  const [isOpen, setIsOpen] = useState(false);
  const [activeIndex, setActiveIndex] = useState(-1);
  const containerRef = useRef<HTMLDivElement>(null);
  const listboxId = useId();

  const results = useMemo(() => {
    const trimmed = query.trim().toLowerCase();
    if (trimmed === "") return [];
    return calculatorRegistry
      .filter(
        (calculator) =>
          calculator.name.toLowerCase().includes(trimmed) ||
          calculator.description.toLowerCase().includes(trimmed)
      )
      .slice(0, 8);
  }, [query]);

  function handleKeyDown(e: React.KeyboardEvent<HTMLInputElement>) {
    if (!isOpen || results.length === 0) return;
    if (e.key === "ArrowDown") {
      e.preventDefault();
      setActiveIndex((i) => (i + 1) % results.length);
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setActiveIndex((i) => (i - 1 + results.length) % results.length);
    } else if (e.key === "Escape") {
      setIsOpen(false);
    }
  }

  return (
    <div ref={containerRef} className={cn("relative w-full max-w-xl", className)}>
      <Search
        className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground"
        aria-hidden="true"
      />
      <Input
        type="search"
        placeholder="Search calculators…"
        aria-label="Search calculators"
        role="combobox"
        aria-expanded={isOpen && results.length > 0}
        aria-controls={listboxId}
        aria-autocomplete="list"
        className="h-12 pl-10"
        value={query}
        onChange={(e) => {
          setQuery(e.target.value);
          setIsOpen(true);
          setActiveIndex(-1);
        }}
        onFocus={() => setIsOpen(true)}
        onBlur={() => {
          // Delay so a click on a result registers before the dropdown closes.
          setTimeout(() => setIsOpen(false), 150);
        }}
        onKeyDown={handleKeyDown}
      />

      {isOpen && results.length > 0 ? (
        <ul
          id={listboxId}
          role="listbox"
          aria-label="Calculator search results"
          className="absolute z-10 mt-2 w-full overflow-hidden rounded-lg border border-border bg-card text-left shadow-md"
        >
          {results.map((calculator, index) => (
            <li key={calculator.slug} role="option" aria-selected={index === activeIndex}>
              <Link
                href={`/calculators/${calculator.slug}`}
                className={cn(
                  "flex flex-col gap-0.5 px-4 py-2.5 text-sm hover:bg-muted",
                  index === activeIndex ? "bg-muted" : ""
                )}
              >
                <span className="font-medium">{calculator.name}</span>
                <span className="text-xs text-muted-foreground">{calculator.description}</span>
              </Link>
            </li>
          ))}
        </ul>
      ) : isOpen && query.trim() !== "" ? (
        <div className="absolute z-10 mt-2 w-full rounded-lg border border-border bg-card p-4 text-sm text-muted-foreground shadow-md">
          No calculators match &quot;{query}&quot;.
        </div>
      ) : null}
    </div>
  );
}

import { Search } from "lucide-react";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";

interface SearchBarProps {
  className?: string;
}

/**
 * Phase 3 note: this is a real, accessible input, but it isn't wired to
 * actual search logic yet — there's no calculator/formula/concept data to
 * search through until Phase 4+ builds that content. Wiring this up is a
 * deliberate follow-up once real content exists, not an oversight.
 */
export function SearchBar({ className }: SearchBarProps) {
  return (
    <div className={cn("relative w-full max-w-xl", className)}>
      <Search
        className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground"
        aria-hidden="true"
      />
      <Input
        type="search"
        placeholder="Search calculators, formulas, or concepts…"
        aria-label="Search calculators, formulas, or concepts"
        className="h-12 pl-10"
      />
    </div>
  );
}

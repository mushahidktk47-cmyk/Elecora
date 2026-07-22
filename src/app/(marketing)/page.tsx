import { ThemeToggle } from "@/components/shared/theme-toggle";
import { Badge } from "@/components/ui/badge";
import { FormulaDisplay } from "@/components/engineering/formula-display";
import { ResultCard } from "@/components/engineering/result-card";

/**
 * Home page — lives in the (marketing) route group so it's grouped with
 * other public pages, but is still served at the root URL "/".
 *
 * This is still a Phase 2 placeholder: real content (search, popular
 * calculators, Learn recommendations, AI Tutor CTA) is built in later
 * phases once those features exist to pull data from. This page exists
 * right now mainly to prove the design system renders correctly.
 */
export default function HomePage() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center gap-8 p-8 text-center">
      <ThemeToggle />
      <div className="flex flex-col items-center gap-3">
        <Badge variant="outline">Under construction</Badge>
        <h1 className="text-3xl font-bold tracking-tight">Elecora</h1>
        <p className="max-w-md text-muted-foreground">
          AI-powered electrical engineering platform for students and
          engineers.
        </p>
      </div>

      <div className="flex w-full max-w-sm flex-col gap-4">
        <FormulaDisplay label="Ohm's Law" formula="V = I × R" />
        <ResultCard label="Current" value={2.4} unit="A" formulaUsed="Using I = V / R" />
      </div>
    </main>
  );
}

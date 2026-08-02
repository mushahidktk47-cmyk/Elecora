import Link from "next/link";
import { buttonVariants } from "@/components/ui/button";
import { Container } from "@/components/marketing/container";
import { SectionHeading } from "@/components/marketing/section-heading";
import { CalculatorPreviewCard } from "@/components/marketing/calculator-preview-card";
import { calculatorRegistry } from "@/calculations/registry";
import { cn } from "@/lib/utils";

// Show the first few calculators from the real registry — the registry
// order reflects build/introduction order, which doubles as a reasonable
// "foundational first" ordering for a preview. No fabricated usage
// stats, no manual curation to keep in sync — this list now updates
// itself whenever the registry changes.
const PREVIEW_COUNT = 6;

export function PopularCalculators() {
  const previewCalculators = calculatorRegistry.slice(0, PREVIEW_COUNT);

  return (
    <section className="border-b border-border py-16">
      <Container className="flex flex-col gap-8">
        <div className="flex flex-col items-start justify-between gap-4 sm:flex-row sm:items-end">
          <SectionHeading
            title="Popular calculators"
            description="Jump straight into the tools students use most."
          />
          <Link
            href="/calculators"
            className={cn(buttonVariants({ variant: "outline", size: "sm" }), "shrink-0")}
          >
            View all calculators
          </Link>
        </div>

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {previewCalculators.map((calculator) => (
            <CalculatorPreviewCard key={calculator.slug} calculator={calculator} />
          ))}
        </div>
      </Container>
    </section>
  );
}

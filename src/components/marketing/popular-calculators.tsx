import Link from "next/link";
import { buttonVariants } from "@/components/ui/button";
import { Container } from "@/components/marketing/container";
import { SectionHeading } from "@/components/marketing/section-heading";
import { CalculatorPreviewCard } from "@/components/marketing/calculator-preview-card";
import { popularCalculators } from "@/lib/placeholder-data";
import { cn } from "@/lib/utils";

export function PopularCalculators() {
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
          {popularCalculators.map((calculator) => (
            <CalculatorPreviewCard key={calculator.slug} calculator={calculator} />
          ))}
        </div>
      </Container>
    </section>
  );
}

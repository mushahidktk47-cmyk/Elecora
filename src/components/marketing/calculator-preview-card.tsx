import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { Card, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import type { PlaceholderCalculator } from "@/lib/placeholder-data";

interface CalculatorPreviewCardProps {
  calculator: PlaceholderCalculator;
}

export function CalculatorPreviewCard({ calculator }: CalculatorPreviewCardProps) {
  return (
    <Link href={`/calculators/${calculator.slug}`} className="group block">
      <Card className="h-full transition-colors group-hover:border-primary/50">
        <CardHeader>
          <CardTitle className="flex items-center justify-between gap-2 text-base">
            {calculator.name}
            <ArrowRight
              className="size-4 shrink-0 text-muted-foreground transition-transform group-hover:translate-x-0.5 group-hover:text-primary"
              aria-hidden="true"
            />
          </CardTitle>
          <CardDescription>{calculator.description}</CardDescription>
        </CardHeader>
      </Card>
    </Link>
  );
}

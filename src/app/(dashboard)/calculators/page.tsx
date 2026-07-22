import Link from "next/link";
import { Card, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { calculatorRegistry } from "@/calculations/registry";

export default function CalculatorsPage() {
  return (
    <div className="mx-auto flex max-w-3xl flex-col gap-6 px-4 py-12 sm:px-6 lg:px-8">
      <div className="flex flex-col gap-1">
        <h1 className="text-2xl font-semibold tracking-tight">Calculators</h1>
        <p className="text-muted-foreground">
          More calculators are added regularly — this list grows with the
          registry in src/calculations/registry.ts.
        </p>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        {calculatorRegistry.map((calculator) => (
          <Link key={calculator.slug} href={`/calculators/${calculator.slug}`} className="group block">
            <Card className="h-full transition-colors group-hover:border-primary/50">
              <CardHeader>
                <CardTitle className="text-base">{calculator.name}</CardTitle>
                <CardDescription>{calculator.description}</CardDescription>
              </CardHeader>
            </Card>
          </Link>
        ))}
      </div>
    </div>
  );
}

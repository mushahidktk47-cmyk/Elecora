import Link from "next/link";
import { buttonVariants } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardHeader, CardTitle } from "@/components/ui/card";
import { Container } from "@/components/marketing/container";
import { SectionHeading } from "@/components/marketing/section-heading";
import { learnPreview } from "@/lib/placeholder-data";
import { cn } from "@/lib/utils";

export function LearnPreview() {
  return (
    <section className="border-b border-border py-16">
      <Container className="flex flex-col gap-8">
        <div className="flex flex-col items-start justify-between gap-4 sm:flex-row sm:items-end">
          <SectionHeading
            title="Learn electrical engineering"
            description="Concepts, formulas, and worked examples explained clearly."
          />
          <Link
            href="/learn"
            className={cn(buttonVariants({ variant: "outline", size: "sm" }), "shrink-0")}
          >
            Browse Learn
          </Link>
        </div>

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
          {learnPreview.map((topic) => (
            <Link key={topic.slug} href={`/learn/${topic.slug}`} className="group block">
              <Card className="h-full transition-colors group-hover:border-primary/50">
                <CardHeader className="gap-2">
                  <Badge variant="outline" className="w-fit">
                    {topic.kind}
                  </Badge>
                  <CardTitle className="text-base">{topic.title}</CardTitle>
                </CardHeader>
              </Card>
            </Link>
          ))}
        </div>
      </Container>
    </section>
  );
}

import Link from "next/link";
import { ArrowRight, Bot } from "lucide-react";
import { buttonVariants } from "@/components/ui/button";
import { SearchBar } from "@/components/marketing/search-bar";
import { Container } from "@/components/marketing/container";
import { cn } from "@/lib/utils";

export function Hero() {
  return (
    <section className="border-b border-border">
      <Container className="flex flex-col items-center gap-6 py-16 text-center sm:py-24">
        <h1 className="max-w-2xl text-3xl font-bold tracking-tight sm:text-5xl">
          Learn and calculate electrical engineering, all in one place
        </h1>
        <p className="max-w-xl text-muted-foreground sm:text-lg">
          Calculators, formulas, and an AI tutor built for electrical
          engineering students — with every numeric answer computed by
          verified, deterministic formulas, not guessed by AI.
        </p>

        <SearchBar />

        <div className="flex flex-col gap-3 sm:flex-row">
          <Link href="/calculators" className={cn(buttonVariants({ size: "lg" }))}>
            Explore Calculators
            <ArrowRight className="size-4" aria-hidden="true" />
          </Link>
          <Link
            href="/tutor"
            className={cn(buttonVariants({ variant: "outline", size: "lg" }))}
          >
            <Bot className="size-4" aria-hidden="true" />
            Ask AI Tutor
          </Link>
        </div>
      </Container>
    </section>
  );
}

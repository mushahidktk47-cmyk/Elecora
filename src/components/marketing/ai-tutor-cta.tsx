import Link from "next/link";
import { Bot, MessageSquare, ListChecks, ShieldCheck } from "lucide-react";
import { buttonVariants } from "@/components/ui/button";
import { Container } from "@/components/marketing/container";
import { cn } from "@/lib/utils";

const capabilities = [
  {
    icon: MessageSquare,
    title: "Explain concepts",
    description: "Ask about any electrical engineering topic in plain language.",
  },
  {
    icon: ListChecks,
    title: "Solve problems step-by-step",
    description: "Get guided, numbered walkthroughs instead of just an answer.",
  },
  {
    icon: ShieldCheck,
    title: "Verified numbers, always",
    description:
      "Any calculation is run through Elecora's calculator engine — never guessed by the AI.",
  },
];

export function AiTutorCta() {
  return (
    <section className="border-b border-border py-16">
      <Container className="flex flex-col items-center gap-8 text-center">
        <div className="flex flex-col items-center gap-3">
          <Bot className="size-8 text-primary" aria-hidden="true" />
          <h2 className="text-2xl font-semibold tracking-tight sm:text-3xl">
            Meet your AI Electrical Engineering Tutor
          </h2>
          <p className="max-w-xl text-muted-foreground">
            The tutor explains and guides — every numeric result still comes
            from a verified calculator, not the AI&apos;s own arithmetic.
          </p>
        </div>

        <div className="grid grid-cols-1 gap-6 sm:grid-cols-3">
          {capabilities.map(({ icon: Icon, title, description }) => (
            <div key={title} className="flex flex-col items-center gap-2 text-center">
              <Icon className="size-5 text-primary" aria-hidden="true" />
              <h3 className="text-sm font-semibold">{title}</h3>
              <p className="text-sm text-muted-foreground">{description}</p>
            </div>
          ))}
        </div>

        <Link href="/tutor" className={cn(buttonVariants({ size: "lg" }))}>
          Ask the AI Tutor
        </Link>
      </Container>
    </section>
  );
}

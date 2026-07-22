import Link from "next/link";
import { buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface ComingSoonProps {
  title: string;
  description: string;
}

/**
 * Shared placeholder for routes the navbar/footer link to that don't have
 * real content yet (Calculators, Learn, Quizzes, Tutor, Login, Signup
 * index pages). Exists only so links don't 404 while those features are
 * built in later phases — not a real feature page itself.
 */
export function ComingSoon({ title, description }: ComingSoonProps) {
  return (
    <div className="mx-auto flex min-h-[60vh] max-w-md flex-col items-center justify-center gap-4 px-4 text-center">
      <h1 className="text-2xl font-semibold tracking-tight">{title}</h1>
      <p className="text-muted-foreground">{description}</p>
      <Link href="/" className={cn(buttonVariants({ variant: "outline" }))}>
        Back to home
      </Link>
    </div>
  );
}

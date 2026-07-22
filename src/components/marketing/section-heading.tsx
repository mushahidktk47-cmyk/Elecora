import { cn } from "@/lib/utils";

interface SectionHeadingProps {
  title: string;
  description?: string;
  className?: string;
}

export function SectionHeading({ title, description, className }: SectionHeadingProps) {
  return (
    <div className={cn("flex flex-col gap-2", className)}>
      <h2 className="text-2xl font-semibold tracking-tight sm:text-3xl">{title}</h2>
      {description ? (
        <p className="max-w-2xl text-muted-foreground">{description}</p>
      ) : null}
    </div>
  );
}

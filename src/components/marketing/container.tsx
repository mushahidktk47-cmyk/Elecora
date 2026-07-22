import { cn } from "@/lib/utils";

interface ContainerProps {
  children: React.ReactNode;
  className?: string;
}

/**
 * Consistent max-width + horizontal padding wrapper used by every
 * marketing section, so spacing stays uniform without repeating the
 * same utility classes in six different files.
 */
export function Container({ children, className }: ContainerProps) {
  return (
    <div className={cn("mx-auto w-full max-w-6xl px-4 sm:px-6 lg:px-8", className)}>
      {children}
    </div>
  );
}

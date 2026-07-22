import * as React from "react";
import { cn } from "@/lib/utils";

interface SeparatorProps extends React.ComponentProps<"div"> {
  orientation?: "horizontal" | "vertical";
}

/**
 * Plain divider, kept dependency-free (no @radix-ui/react-separator).
 * decorative by default (role="none") since it's typically used to
 * visually divide content rather than convey semantic structure.
 */
function Separator({ className, orientation = "horizontal", ...props }: SeparatorProps) {
  return (
    <div
      data-slot="separator"
      role="none"
      className={cn(
        "shrink-0 bg-border",
        orientation === "horizontal" ? "h-px w-full" : "h-full w-px",
        className
      )}
      {...props}
    />
  );
}

export { Separator };

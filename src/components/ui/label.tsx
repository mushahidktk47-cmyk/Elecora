import * as React from "react";
import { cn } from "@/lib/utils";

/**
 * Plain <label>, kept dependency-free (no @radix-ui/react-label) since a
 * standard label + htmlFor covers our accessibility needs for now.
 */
function Label({ className, ...props }: React.ComponentProps<"label">) {
  return (
    <label
      data-slot="label"
      className={cn(
        "text-sm font-medium leading-none select-none peer-disabled:cursor-not-allowed peer-disabled:opacity-50",
        className
      )}
      {...props}
    />
  );
}

export { Label };

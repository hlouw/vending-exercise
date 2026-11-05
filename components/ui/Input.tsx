import type { ComponentProps } from "react";
import { cn } from "@/lib/cn";

export function Input({ className, ...props }: ComponentProps<"input">) {
  return (
    <input
      className={cn(
        "rounded-md border border-cabinet-line bg-panel px-2.5 py-1.5 placeholder:text-muted focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent aria-invalid:border-warning aria-invalid:ring-1 aria-invalid:ring-warning",
        className,
      )}
      {...props}
    />
  );
}

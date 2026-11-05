import type { ComponentProps } from "react";
import { cn } from "@/lib/cn";

export function Input({ className, ...props }: ComponentProps<"input">) {
  return (
    <input
      className={cn(
        "rounded-lg border border-zinc-400 bg-white px-3 py-2 text-zinc-900 placeholder:text-zinc-400 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-sky-400 aria-invalid:border-red-500 aria-invalid:ring-2 aria-invalid:ring-red-500",
        className,
      )}
      {...props}
    />
  );
}

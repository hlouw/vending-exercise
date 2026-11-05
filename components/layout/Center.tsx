import type { ComponentProps } from "react";
import { cn } from "@/lib/cn";

/** Horizontally centres its content, never wider than `max-w-*` allows. */
export function Center({ className, ...props }: ComponentProps<"div">) {
  return (
    <div
      className={cn("mx-auto w-full max-w-4xl px-4", className)}
      {...props}
    />
  );
}

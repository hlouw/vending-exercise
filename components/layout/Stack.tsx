import { cva, type VariantProps } from "class-variance-authority";
import type { ComponentProps } from "react";
import { cn } from "@/lib/cn";

const stack = cva("flex flex-col", {
  variants: {
    gap: { sm: "gap-2", md: "gap-4", lg: "gap-6" },
  },
  defaultVariants: { gap: "md" },
});

type StackProps = ComponentProps<"div"> & VariantProps<typeof stack>;

/** Children flow vertically with consistent spacing. */
export function Stack({ gap, className, ...props }: StackProps) {
  return <div className={cn(stack({ gap }), className)} {...props} />;
}

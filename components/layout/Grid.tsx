import { cva, type VariantProps } from "class-variance-authority";
import type { ComponentProps } from "react";
import { cn } from "@/lib/cn";

const grid = cva(
  "grid grid-cols-[repeat(auto-fill,minmax(min(100%,var(--grid-min)),1fr))]",
  {
    variants: {
      gap: { sm: "gap-2", md: "gap-4", lg: "gap-6" },
    },
    defaultVariants: { gap: "md" },
  },
);

type GridProps = ComponentProps<"div"> &
  VariantProps<typeof grid> & {
    /** Smallest a column may be before the grid drops a column, e.g. "9rem". */
    min?: string;
  };

/** Auto-fitting columns: as many as fit at `min` width, no breakpoints. */
export function Grid({
  gap,
  min = "10rem",
  className,
  style,
  ...props
}: GridProps) {
  return (
    <div
      className={cn(grid({ gap }), className)}
      style={{ "--grid-min": min, ...style } as React.CSSProperties}
      {...props}
    />
  );
}

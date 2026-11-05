import { cva, type VariantProps } from "class-variance-authority";
import type { ComponentProps, ElementType } from "react";
import { cn } from "@/lib/cn";

const grid = cva(
  "grid grid-cols-[repeat(auto-fill,minmax(min(100%,var(--grid-min)),1fr))]",
  {
    variants: {
      gap: { sm: "gap-2", md: "gap-4", lg: "gap-6" },
      /** A fixed number of equal columns, instead of auto-fitting. */
      columns: { 2: "grid-cols-2", 3: "grid-cols-3", 4: "grid-cols-4" },
    },
    defaultVariants: { gap: "md" },
  },
);

type GridProps = Omit<ComponentProps<"div">, "ref"> &
  VariantProps<typeof grid> & {
    /** Smallest a column may be before the grid drops a column, e.g. "9rem". */
    min?: string;
    /** Render as a list when the children are list items. */
    as?: "div" | "ul" | "ol";
  };

/**
 * Auto-fitting columns: as many as fit at `min` width, no breakpoints. Pass
 * `columns` instead for a fixed number of equal columns, so the layout never
 * depends on what is inside the cells.
 */
export function Grid({
  as = "div",
  gap,
  columns,
  min = "10rem",
  className,
  style,
  ...props
}: GridProps) {
  const Tag = as as ElementType;
  return (
    <Tag
      className={cn(grid({ gap, columns }), className)}
      style={{ "--grid-min": min, ...style } as React.CSSProperties}
      {...props}
    />
  );
}

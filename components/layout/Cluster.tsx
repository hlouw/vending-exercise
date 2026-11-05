import { cva, type VariantProps } from "class-variance-authority";
import type { ComponentProps, ElementType } from "react";
import { cn } from "@/lib/cn";

const cluster = cva("flex flex-wrap", {
  variants: {
    gap: { sm: "gap-2", md: "gap-4", lg: "gap-6" },
    justify: {
      start: "justify-start",
      center: "justify-center",
      between: "justify-between",
    },
    align: { start: "items-start", center: "items-center" },
  },
  defaultVariants: { gap: "md", justify: "start", align: "center" },
});

type ClusterProps = Omit<ComponentProps<"div">, "ref"> &
  VariantProps<typeof cluster> & {
    /** Render as a list when the children are list items. */
    as?: "div" | "ul" | "ol";
  };

/** Children sit in a row and wrap when they run out of room. */
export function Cluster({
  as = "div",
  gap,
  justify,
  align,
  className,
  ...props
}: ClusterProps) {
  const Tag = as as ElementType;
  return (
    <Tag
      className={cn(cluster({ gap, justify, align }), className)}
      {...props}
    />
  );
}

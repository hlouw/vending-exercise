import { cva, type VariantProps } from "class-variance-authority";
import type { ComponentProps } from "react";
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

type ClusterProps = ComponentProps<"div"> & VariantProps<typeof cluster>;

/** Children sit in a row and wrap when they run out of room. */
export function Cluster({
  gap,
  justify,
  align,
  className,
  ...props
}: ClusterProps) {
  return (
    <div
      className={cn(cluster({ gap, justify, align }), className)}
      {...props}
    />
  );
}

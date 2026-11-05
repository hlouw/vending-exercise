import { cva, type VariantProps } from "class-variance-authority";
import type { ComponentProps } from "react";
import { cn } from "@/lib/cn";

const button = cva(
  "rounded-md font-medium transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent disabled:cursor-not-allowed disabled:opacity-50",
  {
    variants: {
      variant: {
        /** The one main action: Buy. */
        primary: "bg-accent font-semibold text-white hover:bg-accent-hover",
        /** A product slot in the glass. */
        item: "border border-panel-line bg-panel text-left hover:border-accent",
        /** Quick-add and other small controls. */
        secondary: "border border-cabinet-line bg-panel hover:border-accent",
      },
      size: { sm: "px-2 py-1 text-sm", md: "px-3 py-2", lg: "px-4 py-2.5" },
      selected: {
        true: "border-accent ring-2 ring-accent",
        false: "",
      },
    },
    defaultVariants: { variant: "primary", size: "md", selected: false },
  },
);

type ButtonProps = ComponentProps<"button"> & VariantProps<typeof button>;

export function Button({
  variant,
  size,
  selected,
  className,
  type = "button",
  ...props
}: ButtonProps) {
  return (
    <button
      type={type}
      aria-pressed={selected ?? undefined}
      className={cn(button({ variant, size, selected }), className)}
      {...props}
    />
  );
}

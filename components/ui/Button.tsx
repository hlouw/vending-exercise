import { cva, type VariantProps } from "class-variance-authority";
import type { ComponentProps } from "react";
import { cn } from "@/lib/cn";

const button = cva(
  "rounded-lg font-medium transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-sky-400 disabled:cursor-not-allowed disabled:opacity-50",
  {
    variants: {
      variant: {
        /** The one big action: Buy. */
        primary:
          "bg-emerald-500 font-semibold text-emerald-950 shadow-md hover:bg-emerald-400 active:translate-y-px",
        /** A product slot in the glass. */
        item: "bg-zinc-100/95 text-left text-zinc-900 shadow hover:bg-white",
        /** Quick-add and other small controls on the panel. */
        coin: "border border-machine-trim/50 bg-machine-dark text-white hover:bg-machine",
      },
      size: { md: "px-4 py-2", lg: "px-4 py-3", xl: "px-6 py-4 text-lg" },
      selected: {
        true: "ring-4 ring-amber-300",
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

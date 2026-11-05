import { cva, type VariantProps } from "class-variance-authority";
import type { ComponentProps } from "react";
import { cn } from "@/lib/cn";

const button = cva(
  "rounded-lg font-medium transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-sky-500 disabled:cursor-not-allowed disabled:opacity-50",
  {
    variants: {
      variant: {
        primary: "bg-sky-600 text-white hover:bg-sky-700",
        item: "border border-zinc-300 bg-white text-left hover:border-sky-500 dark:border-zinc-700 dark:bg-zinc-900",
      },
      size: { md: "px-4 py-2", lg: "px-5 py-4" },
      selected: {
        true: "border-sky-600 ring-2 ring-sky-600",
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

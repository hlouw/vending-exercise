import { cva, type VariantProps } from "class-variance-authority";
import type { ComponentProps } from "react";
import { cn } from "@/lib/cn";

const box = cva("rounded-xl", {
  variants: {
    padding: { sm: "p-3", md: "p-4", lg: "p-6" },
    tone: {
      plain: "",
      body: "bg-machine text-white shadow-xl ring-1 ring-machine-dark",
      glass: "bg-glass/90 ring-4 ring-zinc-300/40 ring-inset",
      display: "bg-display font-mono text-display-text ring-2 ring-black/60",
      tray: "bg-tray text-zinc-100 shadow-inner ring-2 ring-black",
      panel: "bg-machine-dark/70 text-white ring-1 ring-machine-trim/30",
    },
  },
  defaultVariants: { padding: "md", tone: "plain" },
});

type BoxProps = ComponentProps<"div"> & VariantProps<typeof box>;

/** A padded surface. The tone says what part of the machine it is. */
export function Box({ padding, tone, className, ...props }: BoxProps) {
  return <div className={cn(box({ padding, tone }), className)} {...props} />;
}

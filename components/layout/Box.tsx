import { cva, type VariantProps } from "class-variance-authority";
import type { ComponentProps } from "react";
import { cn } from "@/lib/cn";

const box = cva("rounded-lg", {
  variants: {
    padding: { sm: "p-3", md: "p-4" },
    tone: {
      plain: "",
      body: "bg-cabinet ring-1 ring-cabinet-line",
      glass: "bg-glass ring-1 ring-glass-line",
      display: "bg-display font-mono text-display-text",
      tray: "bg-tray ring-1 ring-cabinet-line",
      panel: "bg-panel ring-1 ring-panel-line",
    },
  },
  defaultVariants: { padding: "md", tone: "plain" },
});

type BoxProps = ComponentProps<"div"> & VariantProps<typeof box>;

/** A padded surface. The tone says what part of the machine it is. */
export function Box({ padding, tone, className, ...props }: BoxProps) {
  return <div className={cn(box({ padding, tone }), className)} {...props} />;
}

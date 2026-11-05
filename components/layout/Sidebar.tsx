import type { ComponentProps } from "react";
import { cn } from "@/lib/cn";

type SidebarProps = ComponentProps<"div"> & {
  /** Width the sidebar wants when beside the content, e.g. "20rem". */
  sidebarWidth?: string;
  /** Share of the row the content needs before the sidebar wraps below it. */
  contentMin?: string;
};

/**
 * Content with a sidebar. Beside each other when there is room, stacked
 * (sidebar below) when there isn't. No breakpoints. The first child is the
 * content and the second is the sidebar.
 */
export function Sidebar({
  sidebarWidth = "20rem",
  contentMin = "55%",
  className,
  style,
  ...props
}: SidebarProps) {
  return (
    <div
      className={cn(
        "flex flex-wrap gap-4 [&>:first-child]:grow-999 [&>:first-child]:basis-0 [&>:first-child]:[min-inline-size:var(--content-min)] [&>:last-child]:grow [&>:last-child]:basis-(--sidebar-width)",
        className,
      )}
      style={
        {
          "--sidebar-width": sidebarWidth,
          "--content-min": contentMin,
          ...style,
        } as React.CSSProperties
      }
      {...props}
    />
  );
}

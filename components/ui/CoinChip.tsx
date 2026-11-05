import { cva, type VariantProps } from "class-variance-authority";
import type { ComponentProps } from "react";
import { cn } from "@/lib/cn";
import type { Coin } from "@/lib/domain/coins";
import { formatCoin } from "@/lib/format";

const coinChip = cva(
  "inline-flex shrink-0 items-center justify-center rounded-full font-semibold text-ink tabular-nums ring-inset",
  {
    variants: {
      metal: {
        copper: "bg-copper ring-1 ring-copper-edge",
        silver: "bg-silver ring-1 ring-silver-edge",
        gold: "bg-gold ring-1 ring-gold-edge",
        // £2: a gold ring around a silver centre.
        bimetal: "bg-silver ring-3 ring-gold-edge",
      },
      size: { sm: "size-8 text-[0.6875rem]", md: "size-10 text-xs" },
      empty: { true: "opacity-40 grayscale", false: "" },
    },
    defaultVariants: { metal: "silver", size: "md", empty: false },
  },
);

type Metal = NonNullable<VariantProps<typeof coinChip>["metal"]>;

/** UK coins: 1p and 2p are copper, £1 is gold, £2 is two-tone. */
const METAL: Record<Coin, Metal> = {
  1: "copper",
  2: "copper",
  5: "silver",
  10: "silver",
  20: "silver",
  50: "silver",
  100: "gold",
  200: "bimetal",
};

type CoinChipProps = Omit<ComponentProps<"span">, "children"> &
  Pick<VariantProps<typeof coinChip>, "size" | "empty"> & { coin: Coin };

/** A coin, drawn in its metal and labelled with its value. */
export function CoinChip({
  coin,
  size,
  empty,
  className,
  ...props
}: CoinChipProps) {
  return (
    <span
      className={cn(coinChip({ metal: METAL[coin], size, empty }), className)}
      {...props}
    >
      {formatCoin(coin)}
    </span>
  );
}

import { Cluster } from "@/components/layout/Cluster";
import { Stack } from "@/components/layout/Stack";
import { cn } from "@/lib/cn";
import { COINS } from "@/lib/domain/coins";
import { formatCoin } from "@/lib/format";
import type { StockResponse } from "@/lib/schemas";

/** The Coins the machine still holds for Change. */
export function StockPanel({ stock }: { stock: StockResponse | null }) {
  return (
    <Stack gap="sm">
      <h2 className="font-medium">Change available</h2>
      {stock === null ? (
        <p className="text-sm text-zinc-500">Loading…</p>
      ) : (
        <Cluster as="ul" gap="sm">
          {COINS.map((coin) => {
            const count = stock.supply[String(coin)] ?? 0;
            return (
              <li
                key={coin}
                className={cn(
                  "rounded-lg border border-zinc-300 px-3 py-1 text-sm",
                  count === 0 && "text-zinc-400 line-through opacity-60",
                )}
              >
                {formatCoin(coin)}: {count}
                {count === 0 && <span className="sr-only"> (empty)</span>}
              </li>
            );
          })}
        </Cluster>
      )}
    </Stack>
  );
}

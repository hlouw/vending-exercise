import { Cluster } from "@/components/layout/Cluster";
import { Stack } from "@/components/layout/Stack";
import { CoinChip } from "@/components/ui/CoinChip";
import { COINS } from "@/lib/domain/coins";
import { formatCoin } from "@/lib/format";
import type { StockResponse } from "@/lib/schemas";

/** The Coins the machine still holds for Change. */
export function StockPanel({ stock }: { stock: StockResponse | null }) {
  return (
    <Stack gap="sm">
      <h2 className="text-lg font-semibold">Change available</h2>
      {stock === null ? (
        <p className="text-sm text-machine-trim">Loading…</p>
      ) : (
        <Cluster as="ul" gap="sm">
          {COINS.map((coin) => {
            const count = stock.supply[String(coin)] ?? 0;
            return (
              <li key={coin} className="flex items-center gap-1">
                <CoinChip
                  coin={coin}
                  size="sm"
                  empty={count === 0}
                  aria-hidden
                />
                <span className="sr-only">{formatCoin(coin)}: </span>
                <span className="tabular-nums">
                  ×{count}
                  {count === 0 && (
                    <span className="ml-1 text-xs text-machine-trim">
                      empty
                    </span>
                  )}
                </span>
              </li>
            );
          })}
        </Cluster>
      )}
    </Stack>
  );
}

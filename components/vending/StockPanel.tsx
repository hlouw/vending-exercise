import { Grid } from "@/components/layout/Grid";
import { Stack } from "@/components/layout/Stack";
import { CoinChip } from "@/components/ui/CoinChip";
import { COINS } from "@/lib/domain/coins";
import { formatCoin } from "@/lib/format";
import type { StockResponse } from "@/lib/schemas";

/**
 * The Coins the machine still holds for Change. Four equal columns, and each
 * cell is one line of text under its coin, so nothing shifts when a count
 * changes, a coin runs out, or the stock first loads.
 */
export function StockPanel({ stock }: { stock: StockResponse | null }) {
  return (
    <Stack gap="sm">
      <h2 className="text-lg font-semibold">Change available</h2>
      <Grid as="ul" columns={4} gap="sm">
        {COINS.map((coin) => {
          // null while loading: show a dash in the same space.
          const count =
            stock === null ? null : (stock.supply[String(coin)] ?? 0);
          return (
            <li key={coin} className="flex flex-col items-center gap-1">
              <CoinChip coin={coin} size="sm" empty={count === 0} aria-hidden />
              <span className="sr-only">{formatCoin(coin)}: </span>
              <span className="text-sm tabular-nums">
                {count === null ? "–" : count === 0 ? "empty" : `×${count}`}
              </span>
            </li>
          );
        })}
      </Grid>
    </Stack>
  );
}

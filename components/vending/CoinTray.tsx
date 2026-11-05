import { Box } from "@/components/layout/Box";
import { Cluster } from "@/components/layout/Cluster";
import { Stack } from "@/components/layout/Stack";
import { CoinChip } from "@/components/ui/CoinChip";
import type { ChangeCoin } from "@/components/vending/OutcomeMessage";

/**
 * Where Change lands, and nothing else: `OutcomeMessage` says what happened.
 * `change` is null until a Purchase is Dispensed, and empty for exact payment.
 */
export function CoinTray({
  change,
  className,
}: {
  change: ChangeCoin[] | null;
  className?: string;
}) {
  return (
    <Box tone="tray" padding="sm" className={className}>
      <Stack gap="sm">
        <h2 className="text-sm font-semibold">Coin tray</h2>
        {change && change.length > 0 ? (
          <Cluster as="ul" gap="sm" aria-label="Change coins">
            {change.flatMap(({ coin, count }, group) =>
              Array.from({ length: count }, (_, i) => (
                <li
                  key={`${coin}-${i}`}
                  className="motion-safe:animate-coin-drop"
                  style={{ animationDelay: `${group * 80 + i * 60}ms` }}
                >
                  <CoinChip coin={coin} size="md" />
                </li>
              )),
            )}
          </Cluster>
        ) : (
          <p className="text-sm text-muted">
            {change ? "No change to collect." : "Your change will land here."}
          </p>
        )}
      </Stack>
    </Box>
  );
}

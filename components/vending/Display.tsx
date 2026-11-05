import { Box } from "@/components/layout/Box";
import { Cluster } from "@/components/layout/Cluster";
import { Stack } from "@/components/layout/Stack";
import { formatPence } from "@/lib/format";

/** What an amount reads as on the display before there is one. */
const NONE = "--.--";

function Row({ label, pence }: { label: string; pence: number | null }) {
  return (
    <Cluster justify="between" gap="sm">
      <span className="text-sm tracking-widest uppercase">{label}</span>
      <span className="text-2xl tabular-nums">
        {pence === null ? NONE : formatPence(pence)}
      </span>
    </Cluster>
  );
}

/** The LCD. Price and Amount Paid are always on it, whatever is selected. */
export function Display({
  price,
  amountPaid,
}: {
  price: number | null;
  amountPaid: number | null;
}) {
  return (
    <Box tone="display" aria-label="Display" role="group">
      <Stack gap="sm">
        <Row label="Price" pence={price} />
        <Row label="Paying" pence={amountPaid} />
      </Stack>
    </Box>
  );
}

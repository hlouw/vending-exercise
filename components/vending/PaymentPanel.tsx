import { Cluster } from "@/components/layout/Cluster";
import { Stack } from "@/components/layout/Stack";
import { Button } from "@/components/ui/Button";
import { formatPence } from "@/lib/format";

/** What a Customer can put in, in pence. */
const QUICK_ADD = [100, 200, 500, 1000, 2000] as const;

interface PaymentPanelProps {
  price: number | null;
  /** What the Customer typed, in pounds. */
  amountText: string;
  /** The typed amount in pence, or null if it isn't a valid amount. */
  amountPaid: number | null;
  onAmountTextChange: (text: string) => void;
  onQuickAdd: (pence: number) => void;
  onClear: () => void;
}

export function PaymentPanel({
  price,
  amountText,
  amountPaid,
  onAmountTextChange,
  onQuickAdd,
  onClear,
}: PaymentPanelProps) {
  return (
    <Stack gap="sm">
      <Cluster justify="between">
        <span>Price: {price === null ? "–" : formatPence(price)}</span>
        <span>
          Paying: {amountPaid === null ? "–" : formatPence(amountPaid)}
        </span>
      </Cluster>

      <label className="flex flex-col gap-1">
        <span className="text-sm">Amount paid (£)</span>
        <input
          inputMode="decimal"
          value={amountText}
          onChange={(e) => onAmountTextChange(e.target.value)}
          aria-invalid={amountText !== "" && amountPaid === null}
          placeholder="0.00"
          className="rounded-lg border border-zinc-300 px-3 py-2 dark:border-zinc-700 dark:bg-zinc-900"
        />
      </label>

      <Cluster gap="sm">
        {QUICK_ADD.map((pence) => (
          <Button
            key={pence}
            variant="item"
            onClick={() => onQuickAdd(pence)}
            aria-label={`Add ${formatPence(pence)}`}
          >
            +£{pence / 100}
          </Button>
        ))}
        <Button variant="item" onClick={onClear}>
          Clear
        </Button>
      </Cluster>
    </Stack>
  );
}

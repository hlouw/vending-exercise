import { Cluster } from "@/components/layout/Cluster";
import { Stack } from "@/components/layout/Stack";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Display } from "@/components/vending/Display";
import { formatPence } from "@/lib/format";
import { MAX_PENCE } from "@/lib/schemas";

/** What a Customer can put in, in pence. */
const QUICK_ADD = [100, 200, 500, 1000, 2000] as const;

interface PaymentPanelProps {
  price: number | null;
  /** What the Customer typed, in pounds. */
  amountText: string;
  /** The typed amount in pence, or null if it isn't a valid amount. */
  amountPaid: number | null;
  canBuy: boolean;
  busy: boolean;
  onAmountTextChange: (text: string) => void;
  onQuickAdd: (pence: number) => void;
  onClear: () => void;
  onBuy: () => void;
}

export function PaymentPanel({
  price,
  amountText,
  amountPaid,
  canBuy,
  busy,
  onAmountTextChange,
  onQuickAdd,
  onClear,
  onBuy,
}: PaymentPanelProps) {
  const invalid = amountText.trim() !== "" && amountPaid === null;

  return (
    <form
      onSubmit={(event) => {
        event.preventDefault();
        if (canBuy) onBuy();
      }}
    >
      <Stack gap="md">
        <h2 className="text-lg font-semibold">Pay</h2>
        <Display price={price} amountPaid={amountPaid} />

        <label className="flex flex-col gap-1">
          <span className="text-sm">Amount paid (£)</span>
          <Input
            inputMode="decimal"
            value={amountText}
            onChange={(e) => onAmountTextChange(e.target.value)}
            aria-invalid={invalid}
            aria-describedby={invalid ? "amount-error" : undefined}
            placeholder="0.00"
            autoComplete="off"
          />
        </label>
        {invalid && (
          <p id="amount-error" className="text-sm text-amber-300">
            Enter an amount between £0.01 and {formatPence(MAX_PENCE)}, like
            1.50.
          </p>
        )}

        <Cluster gap="sm">
          {QUICK_ADD.map((pence) => (
            <Button
              key={pence}
              variant="coin"
              onClick={() => onQuickAdd(pence)}
              aria-label={`Add ${formatPence(pence)}`}
            >
              +£{pence / 100}
            </Button>
          ))}
          <Button variant="coin" onClick={onClear}>
            Clear
          </Button>
        </Cluster>

        <Button type="submit" size="xl" disabled={!canBuy}>
          {busy ? "Buying…" : "Buy"}
        </Button>
        {price === null && (
          <p className="text-sm text-machine-trim">Pick an item to begin.</p>
        )}
      </Stack>
    </form>
  );
}

import { Grid } from "@/components/layout/Grid";
import { Stack } from "@/components/layout/Stack";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { cn } from "@/lib/cn";
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
      <Stack gap="sm">
        <h2 className="text-sm font-semibold">Pay</h2>
        <Display price={price} amountPaid={amountPaid} />

        <label className="flex flex-col gap-1">
          <span className="text-xs text-muted">Amount paid (£)</span>
          <Input
            inputMode="decimal"
            value={amountText}
            onChange={(e) => onAmountTextChange(e.target.value)}
            aria-invalid={invalid}
            aria-describedby={invalid ? "amount-help" : undefined}
            placeholder="0.00"
            autoComplete="off"
          />
        </label>
        {/* One line, always present, so the panels below never jump. */}
        <p
          id="amount-help"
          className={cn(
            "min-h-4 text-xs",
            invalid ? "text-warning" : "text-muted",
          )}
        >
          {invalid
            ? `Enter £0.01–${formatPence(MAX_PENCE)}, like 1.50.`
            : price === null
              ? "Pick an item to begin."
              : ""}
        </p>

        <Grid columns={3} gap="sm">
          {QUICK_ADD.map((pence) => (
            <Button
              key={pence}
              variant="secondary"
              size="sm"
              onClick={() => onQuickAdd(pence)}
              aria-label={`Add ${formatPence(pence)}`}
            >
              +£{pence / 100}
            </Button>
          ))}
          <Button variant="secondary" size="sm" onClick={onClear}>
            Clear
          </Button>
        </Grid>

        <Button type="submit" size="lg" disabled={!canBuy}>
          {busy ? "Buying…" : "Buy"}
        </Button>
      </Stack>
    </form>
  );
}

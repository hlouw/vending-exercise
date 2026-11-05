import { COINS } from "@/lib/domain/coins";
import type { PurchaseResponse } from "@/lib/schemas";
import { formatCoin, formatPence } from "@/lib/format";

const REFUSALS = {
  INSUFFICIENT_PAYMENT: "That isn't enough to cover the price.",
  CANNOT_MAKE_CHANGE:
    "The machine can't give exact change for that payment. Try a different amount.",
} as const;

export type TrayOutcome =
  | { kind: "response"; itemName: string; response: PurchaseResponse }
  | { kind: "error" };

/** Where the Outcome appears: Change coins, or why the Purchase was Refused. */
export function CoinTray({ outcome }: { outcome: TrayOutcome | null }) {
  return (
    <div
      role="status"
      aria-live="polite"
      className="min-h-20 rounded-lg border border-dashed border-zinc-400 p-4"
    >
      {outcome && <Message outcome={outcome} />}
    </div>
  );
}

function Message({ outcome }: { outcome: TrayOutcome }) {
  if (outcome.kind === "error") {
    return <p>Something went wrong. Please try again.</p>;
  }
  const { itemName, response } = outcome;
  switch (response.status) {
    case "dispensed": {
      const coins = COINS.flatMap((coin) => {
        const count = response.change[String(coin)] ?? 0;
        return count > 0 ? [{ coin, count }] : [];
      });
      return (
        <>
          <p className="font-medium">{itemName} dispensed.</p>
          {coins.length === 0 ? (
            <p>No change.</p>
          ) : (
            <>
              <p>Your change: {formatPence(response.changeTotal)}</p>
              <ul className="mt-2 flex flex-wrap gap-2">
                {coins.map(({ coin, count }) => (
                  <li
                    key={coin}
                    className="rounded-full border border-zinc-400 px-3 py-1 text-sm"
                  >
                    {count} × {formatCoin(coin)}
                  </li>
                ))}
              </ul>
            </>
          )}
        </>
      );
    }
    case "refused":
      return (
        <>
          <p className="font-medium">Purchase refused.</p>
          <p>{REFUSALS[response.reason]}</p>
          <p>You keep your money.</p>
        </>
      );
    case "invalid":
      return (
        <p>That request wasn&apos;t valid: {response.issues.join(", ")}</p>
      );
    case "unauthorized":
      return <p>The machine doesn&apos;t know who you are.</p>;
  }
}

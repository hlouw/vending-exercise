import { cva } from "class-variance-authority";
import { cn } from "@/lib/cn";
import { COINS, type Coin } from "@/lib/domain/coins";
import { formatCoin, formatPence } from "@/lib/format";
import type { PurchaseResponse } from "@/lib/schemas";

const REFUSALS = {
  INSUFFICIENT_PAYMENT: "That isn't enough to cover the price.",
  CANNOT_MAKE_CHANGE:
    "The machine can't give exact change for that payment. Try a different amount.",
} as const;

const KEEP_MONEY = "You keep your money.";

export type DisplayedOutcome =
  | { kind: "response"; itemName: string; response: PurchaseResponse }
  | { kind: "error" };

export interface ChangeCoin {
  coin: Coin;
  count: number;
}

/** The Coins handed back, largest first. Null unless the Purchase Dispensed. */
export function changeCoinsOf(
  outcome: DisplayedOutcome | null,
): ChangeCoin[] | null {
  if (outcome?.kind !== "response") return null;
  const { response } = outcome;
  if (response.status !== "dispensed") return null;
  return COINS.flatMap((coin) => {
    const count = response.change[String(coin)] ?? 0;
    return count > 0 ? [{ coin, count }] : [];
  });
}

/** Colour reinforces the Outcome; the icon and heading say it in words. */
const message = cva(
  "flex min-h-19 flex-col justify-center rounded-lg px-3 py-2 text-sm ring-1",
  {
    variants: {
      tone: {
        idle: "bg-panel text-muted ring-panel-line",
        success: "bg-emerald-50 text-emerald-900 ring-emerald-300",
        refused: "bg-amber-50 text-amber-900 ring-amber-300",
        limited: "bg-rose-50 text-rose-900 ring-rose-300",
        error: "bg-zinc-100 text-zinc-800 ring-zinc-300",
      },
    },
  },
);

type Tone = NonNullable<Parameters<typeof message>[0]>["tone"];

interface View {
  tone: Tone;
  icon: string;
  heading: string;
  body: string;
}

function toView(outcome: DisplayedOutcome): View {
  if (outcome.kind === "error") {
    return {
      tone: "error",
      icon: "⚠",
      heading: "Something went wrong",
      body: "Please try again.",
    };
  }
  const { itemName, response } = outcome;
  switch (response.status) {
    case "dispensed":
      return {
        tone: "success",
        icon: "✓",
        heading: `${itemName} dispensed`,
        body:
          response.changeTotal === 0
            ? "No change."
            : `Your change: ${formatPence(response.changeTotal)}`,
      };
    case "refused":
      return {
        tone: "refused",
        icon: "✕",
        heading: "Purchase refused",
        body: `${REFUSALS[response.reason]} ${KEEP_MONEY}`,
      };
    case "rate_limited": {
      const seconds = Math.ceil(response.retryAfterMs / 1000);
      return {
        tone: "limited",
        icon: "⏱",
        heading: "Slow down!",
        body: `You've made too many purchases. Try again in ${seconds} ${seconds === 1 ? "second" : "seconds"}. ${KEEP_MONEY}`,
      };
    }
    case "invalid":
      return {
        tone: "error",
        icon: "⚠",
        heading: "That request wasn't valid",
        body: response.issues.join(", "),
      };
    case "unauthorized":
      return {
        tone: "error",
        icon: "⚠",
        heading: "The machine doesn't know who you are",
        body: "Enter a different identity above.",
      };
  }
}

/**
 * What happened to the Purchase. Always mounted, so screen readers announce
 * each change, and it reserves its height, so the tray below doesn't move.
 */
export function OutcomeMessage({
  outcome,
}: {
  outcome: DisplayedOutcome | null;
}) {
  if (!outcome) {
    return (
      <div
        role="status"
        aria-live="polite"
        className={message({ tone: "idle" })}
      >
        Pick an item and pay. The result will show here.
      </div>
    );
  }

  const view = toView(outcome);
  const coins = changeCoinsOf(outcome);
  return (
    <div
      role="status"
      aria-live="polite"
      className={cn(message({ tone: view.tone }))}
    >
      <p className="font-semibold">
        <span aria-hidden>{view.icon} </span>
        {view.heading}
      </p>
      <p>{view.body}</p>
      {/* The coins are drawn in the tray, outside this live region. */}
      {coins && coins.length > 0 && (
        <p className="sr-only">
          Coins:{" "}
          {coins
            .map(({ coin, count }) => `${count} × ${formatCoin(coin)}`)
            .join(", ")}
          .
        </p>
      )}
    </div>
  );
}

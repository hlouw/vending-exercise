import { cva } from "class-variance-authority";
import { Box } from "@/components/layout/Box";
import { Cluster } from "@/components/layout/Cluster";
import { Stack } from "@/components/layout/Stack";
import { CoinChip } from "@/components/ui/CoinChip";
import { cn } from "@/lib/cn";
import { COINS } from "@/lib/domain/coins";
import { formatPence } from "@/lib/format";
import type { PurchaseResponse } from "@/lib/schemas";

const REFUSALS = {
  INSUFFICIENT_PAYMENT: "That isn't enough to cover the price.",
  CANNOT_MAKE_CHANGE:
    "The machine can't give exact change for that payment. Try a different amount.",
} as const;

export type TrayOutcome =
  | { kind: "response"; itemName: string; response: PurchaseResponse }
  | { kind: "error" };

/** Colour reinforces the outcome; the icon and heading say it in words. */
const banner = cva("rounded-lg px-3 py-2 ring-1", {
  variants: {
    tone: {
      success: "bg-emerald-950 text-emerald-200 ring-emerald-500",
      refused: "bg-amber-950 text-amber-200 ring-amber-500",
      limited: "bg-rose-950 text-rose-200 ring-rose-500",
      error: "bg-zinc-800 text-zinc-100 ring-zinc-500",
    },
  },
});

type Tone = NonNullable<Parameters<typeof banner>[0]>["tone"];

interface View {
  tone: Tone;
  icon: string;
  heading: string;
  body: string;
  reassurance?: string;
  change?: { coin: (typeof COINS)[number]; count: number }[];
}

function toView(outcome: TrayOutcome): View {
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
    case "dispensed": {
      const change = COINS.flatMap((coin) => {
        const count = response.change[String(coin)] ?? 0;
        return count > 0 ? [{ coin, count }] : [];
      });
      return {
        tone: "success",
        icon: "✓",
        heading: `${itemName} dispensed`,
        body:
          change.length === 0
            ? "No change."
            : `Your change: ${formatPence(response.changeTotal)}`,
        change,
      };
    }
    case "refused":
      return {
        tone: "refused",
        icon: "✕",
        heading: "Purchase refused",
        body: REFUSALS[response.reason],
        reassurance: "You keep your money.",
      };
    case "rate_limited": {
      const seconds = Math.ceil(response.retryAfterMs / 1000);
      return {
        tone: "limited",
        icon: "⏱",
        heading: "Slow down!",
        body: `You've made too many purchases. Try again in ${seconds} ${seconds === 1 ? "second" : "seconds"}.`,
        reassurance: "You keep your money.",
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
        body: "Pick an identity below.",
      };
  }
}

/** Where the Outcome appears: Change coins, or why the Purchase was Refused. */
export function CoinTray({ outcome }: { outcome: TrayOutcome | null }) {
  const view = outcome && toView(outcome);

  return (
    <Box tone="tray" className="min-h-28">
      <Stack gap="sm">
        <h2 className="text-sm tracking-widest text-zinc-400 uppercase">
          Coin tray
        </h2>
        {/* Always mounted, so screen readers announce what appears in it. */}
        <div role="status" aria-live="polite">
          {view ? (
            <Stack gap="sm">
              <div className={cn(banner({ tone: view.tone }))}>
                <p className="font-semibold">
                  <span aria-hidden>{view.icon} </span>
                  {view.heading}
                </p>
                <p>{view.body}</p>
                {view.reassurance && <p>{view.reassurance}</p>}
              </div>
              {view.change && view.change.length > 0 && (
                <Cluster as="ul" gap="sm" aria-label="Change coins">
                  {view.change.flatMap(({ coin, count }, group) =>
                    Array.from({ length: count }, (_, i) => (
                      <li
                        key={`${coin}-${i}`}
                        className="motion-safe:animate-coin-drop"
                        style={{ animationDelay: `${group * 80 + i * 60}ms` }}
                      >
                        <CoinChip coin={coin} />
                      </li>
                    )),
                  )}
                </Cluster>
              )}
            </Stack>
          ) : (
            <p className="text-zinc-400">Your change will appear here.</p>
          )}
        </div>
      </Stack>
    </Box>
  );
}

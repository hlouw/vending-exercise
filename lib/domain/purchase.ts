import { makeChange } from "./change";
import { totalOf, withdraw, type CoinCounts } from "./coins";
import type { MachineState } from "./types";

export type RefusalReason = "INSUFFICIENT_PAYMENT" | "CANNOT_MAKE_CHANGE";

export type PurchaseOutcome =
  | { status: "dispensed"; change: Partial<CoinCounts>; changeTotal: number }
  | { status: "refused"; reason: RefusalReason };

export interface PurchaseInput {
  /** Pence. Already validated at the boundary. */
  price: number;
  /** Pence. Already validated at the boundary. */
  amountPaid: number;
}

/**
 * Pure and synchronous: returns the outcome and the next state.
 *
 * A Refusal returns the very same state, so the Coin Supply and Cash Box are
 * untouched. A dispensed Purchase takes the Change out of the Coin Supply and
 * puts the Amount Paid in the Cash Box, which is never used for Change.
 */
export function purchase(
  state: MachineState,
  { price, amountPaid }: PurchaseInput,
): { outcome: PurchaseOutcome; next: MachineState } {
  if (amountPaid < price) {
    return refuse(state, "INSUFFICIENT_PAYMENT");
  }

  const change = makeChange(amountPaid - price, state.supply);
  if (change === null) {
    return refuse(state, "CANNOT_MAKE_CHANGE");
  }

  return {
    outcome: {
      status: "dispensed",
      change,
      changeTotal: totalOf(change),
    },
    next: {
      supply: withdraw(state.supply, change),
      cashBox: state.cashBox + amountPaid,
    },
  };
}

function refuse(state: MachineState, reason: RefusalReason) {
  return {
    outcome: { status: "refused", reason } as const,
    next: state,
  };
}

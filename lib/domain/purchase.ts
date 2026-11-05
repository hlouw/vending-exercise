import type { CoinCounts } from "./coins";
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
 * A Refusal returns the state untouched.
 */
export function purchase(
  state: MachineState,
  { price, amountPaid }: PurchaseInput,
): { outcome: PurchaseOutcome; next: MachineState } {
  if (amountPaid < price) {
    return {
      outcome: { status: "refused", reason: "INSUFFICIENT_PAYMENT" },
      next: state,
    };
  }

  if (amountPaid > price) {
    // Making Change arrives in the next ticket. Until then the machine
    // cannot give any, so an overpayment is refused.
    return {
      outcome: { status: "refused", reason: "CANNOT_MAKE_CHANGE" },
      next: state,
    };
  }

  return {
    outcome: { status: "dispensed", change: {}, changeTotal: 0 },
    next: { supply: state.supply, cashBox: state.cashBox + amountPaid },
  };
}

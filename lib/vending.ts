import { purchase, type PurchaseOutcome } from "@/lib/domain/purchase";
import { checkRateLimit, RATE_LIMIT } from "@/lib/domain/rateLimit";
import type { PurchaseRequest } from "@/lib/schemas";
import type { MachineStore } from "@/lib/store";

/** Beyond this many remembered Customers, forget the ones outside the window. */
const SWEEP_THRESHOLD = 1000;

export type AttemptCheck =
  { allowed: true } | { allowed: false; retryAfterMs: number };

/**
 * Counts one Purchase attempt against the Customer's rate limit. It touches
 * nothing but the attempt history: never the Coin Supply or Cash Box.
 */
export function registerAttempt(
  store: MachineStore,
  customerId: string,
  now: number,
): AttemptCheck {
  return store.transact((state) => {
    const check = checkRateLimit(state.attempts.get(customerId) ?? [], now);

    const attempts = new Map(state.attempts);
    attempts.set(customerId, check.timestamps);
    if (attempts.size > SWEEP_THRESHOLD) sweep(attempts, now);

    return {
      result: check.allowed
        ? { allowed: true }
        : { allowed: false, retryAfterMs: check.retryAfterMs },
      next: { ...state, attempts },
    };
  });
}

/**
 * One Purchase attempt, for an already-validated request. Synchronous end to
 * end, so it is the single unit a database transaction would wrap.
 */
export function attemptPurchase(
  store: MachineStore,
  request: PurchaseRequest,
): PurchaseOutcome {
  return store.transact((state) => {
    const { outcome, next } = purchase(state, request);
    return { result: outcome, next };
  });
}

/** Forget Customers whose newest attempt has already left the window. */
function sweep(attempts: Map<string, readonly number[]>, now: number) {
  for (const [customerId, timestamps] of attempts) {
    const newest = timestamps[timestamps.length - 1];
    if (newest === undefined || now - newest >= RATE_LIMIT.windowMs) {
      attempts.delete(customerId);
    }
  }
}

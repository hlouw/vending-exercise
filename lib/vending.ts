import { purchase, type PurchaseOutcome } from "@/lib/domain/purchase";
import type { PurchaseRequest } from "@/lib/schemas";
import type { MachineStore } from "@/lib/store";

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

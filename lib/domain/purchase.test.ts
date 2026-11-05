import { describe, expect, it } from "vitest";
import { COINS, initialSupply, type CoinCounts } from "@/lib/domain/coins";
import { purchase } from "@/lib/domain/purchase";
import type { MachineState } from "@/lib/domain/types";

const fresh = (): MachineState => ({
  supply: initialSupply(),
  cashBox: 0,
  attempts: new Map(),
});

function supplyOf(counts: Partial<CoinCounts>): CoinCounts {
  return Object.fromEntries(
    COINS.map((coin) => [coin, counts[coin] ?? 0]),
  ) as CoinCounts;
}

describe("purchase", () => {
  it("dispenses on exact payment with no change", () => {
    const state = fresh();
    const { outcome, next } = purchase(state, { price: 65, amountPaid: 65 });

    expect(outcome).toEqual({
      status: "dispensed",
      change: {},
      changeTotal: 0,
    });
    expect(next.supply).toEqual(state.supply);
    expect(next.cashBox).toBe(65);
  });

  it("gives the fewest coins as change and takes them from the supply", () => {
    const { outcome, next } = purchase(fresh(), { price: 65, amountPaid: 100 });

    expect(outcome).toEqual({
      status: "dispensed",
      change: { 20: 1, 10: 1, 5: 1 },
      changeTotal: 35,
    });
    expect(next.supply).toEqual({ ...initialSupply(), 20: 9, 10: 9, 5: 9 });
  });

  it("puts the amount paid in the cash box, never in the supply", () => {
    const { next } = purchase(fresh(), { price: 65, amountPaid: 200 });

    expect(next.cashBox).toBe(200);
    // The £2 coin that was inserted is not available for change.
    expect(next.supply[200]).toBe(10);
  });

  it("refuses insufficient payment and leaves the state untouched", () => {
    const state = fresh();
    const { outcome, next } = purchase(state, { price: 100, amountPaid: 99 });

    expect(outcome).toEqual({
      status: "refused",
      reason: "INSUFFICIENT_PAYMENT",
    });
    expect(next).toBe(state);
  });

  it("refuses when change cannot be made and leaves the state untouched", () => {
    const state: MachineState = {
      ...fresh(),
      supply: supplyOf({ 2: 10 }),
      cashBox: 40,
    };
    const { outcome, next } = purchase(state, { price: 99, amountPaid: 100 });

    expect(outcome).toEqual({
      status: "refused",
      reason: "CANNOT_MAKE_CHANGE",
    });
    expect(next).toBe(state);
    expect(next.cashBox).toBe(40);
  });

  it("keeps making change from other coins after a denomination runs out", () => {
    let state = fresh();
    // Paying £1 for a 50p item hands back a 50p each time, draining them.
    for (let i = 0; i < 10; i++) {
      state = purchase(state, { price: 50, amountPaid: 100 }).next;
    }
    expect(state.supply[50]).toBe(0);

    const { outcome } = purchase(state, { price: 50, amountPaid: 100 });
    expect(outcome).toEqual({
      status: "dispensed",
      change: { 20: 2, 10: 1 },
      changeTotal: 50,
    });
  });

  it("can eventually run out of change entirely", () => {
    let state = fresh();
    let dispensed = 0;
    for (;;) {
      const { outcome, next } = purchase(state, { price: 1, amountPaid: 200 });
      if (outcome.status === "refused") {
        expect(outcome.reason).toBe("CANNOT_MAKE_CHANGE");
        expect(next).toBe(state);
        break;
      }
      state = next;
      dispensed++;
      expect(dispensed).toBeLessThan(1000);
    }
    expect(dispensed).toBeGreaterThan(0);
  });
});

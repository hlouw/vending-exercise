import { describe, expect, it } from "vitest";
import { createMemoryStore } from "@/lib/server/store";
import { attemptPurchase, registerAttempt } from "@/lib/server/vending";

describe("registerAttempt", () => {
  it("blocks a Customer's fourth attempt but not another Customer's", () => {
    const store = createMemoryStore();
    for (const now of [0, 10, 20]) {
      expect(registerAttempt(store, "alice", now)).toEqual({ allowed: true });
    }

    expect(registerAttempt(store, "alice", 30)).toEqual({
      allowed: false,
      retryAfterMs: 2970,
    });
    expect(registerAttempt(store, "bob", 30)).toEqual({ allowed: true });
  });

  it("touches only the attempt history, never the Coin Supply or Cash Box", () => {
    const store = createMemoryStore();
    const before = store.read();

    for (const now of [0, 1, 2, 3, 4]) registerAttempt(store, "alice", now);

    const after = store.read();
    expect(after.supply).toBe(before.supply);
    expect(after.cashBox).toBe(before.cashBox);
  });

  it("treats names that are object properties as ordinary Customers", () => {
    const store = createMemoryStore();

    for (const id of ["__proto__", "constructor", "toString"]) {
      for (const now of [0, 1, 2]) {
        expect(registerAttempt(store, id, now)).toEqual({ allowed: true });
      }
      expect(registerAttempt(store, id, 3).allowed).toBe(false);
    }
  });

  it("forgets idle Customers once there are very many", () => {
    const store = createMemoryStore();
    for (let i = 0; i <= 1000; i++) registerAttempt(store, `c${i}`, 0);
    expect(store.read().attempts.size).toBe(1001);

    registerAttempt(store, "latecomer", 10_000);

    expect(store.read().attempts.size).toBe(1);
  });
});

describe("attemptPurchase", () => {
  it("leaves the attempt history alone", () => {
    const store = createMemoryStore();
    registerAttempt(store, "alice", 0);

    attemptPurchase(store, { price: 65, amountPaid: 65 });

    expect(store.read().attempts.get("alice")).toEqual([0]);
  });
});

import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { COINS, initialSupply } from "@/lib/domain/coins";
import type { MachineState } from "@/lib/domain/types";
import { POST } from "@/app/api/purchase/route";
import { getStore } from "@/lib/server/store";

function post(body: unknown, headers: Record<string, string> = {}) {
  return POST(
    new Request("http://localhost/api/purchase", {
      method: "POST",
      headers: { "Content-Type": "application/json", ...headers },
      body: typeof body === "string" ? body : JSON.stringify(body),
    }),
  );
}

const asCustomer = { "X-Customer-Id": "customer-1" };

function resetMachine(supply = initialSupply()) {
  getStore().transact((state) => ({
    result: undefined,
    next: { ...state, supply, cashBox: 0, attempts: new Map() },
  }));
}

/** A refused request still counts as an attempt, but moves no money. */
function expectMoneyUnchanged(before: MachineState) {
  const after = getStore().read();
  expect(after.supply).toBe(before.supply);
  expect(after.cashBox).toBe(before.cashBox);
}

beforeEach(() => {
  resetMachine();
  // The route reads the clock itself, so pin it.
  vi.useFakeTimers({ toFake: ["Date"] });
  vi.setSystemTime(1_000_000);
});

afterEach(() => vi.useRealTimers());

describe("POST /api/purchase", () => {
  it("dispenses on exact payment and adds to the cash box only", async () => {
    const before = getStore().read();

    const response = await post({ price: 65, amountPaid: 65 }, asCustomer);

    expect(response.status).toBe(200);
    expect(await response.json()).toEqual({
      status: "dispensed",
      change: {},
      changeTotal: 0,
    });
    const after = getStore().read();
    expect(after.cashBox).toBe(before.cashBox + 65);
    expect(after.supply).toEqual(before.supply);
  });

  it("returns 401 without a customer header", async () => {
    const before = getStore().read();

    const response = await post({ price: 65, amountPaid: 65 });

    expect(response.status).toBe(401);
    expect(await response.json()).toEqual({ status: "unauthorized" });
    expectMoneyUnchanged(before);
  });

  it("returns 401 for an invalid customer header", async () => {
    const response = await post(
      { price: 65, amountPaid: 65 },
      { "X-Customer-Id": "not valid!" },
    );
    expect(response.status).toBe(401);
  });

  it.each([
    ["a float price", { price: 0.5, amountPaid: 65 }],
    ["an extra key", { price: 65, amountPaid: 65, extra: 1 }],
    ["unparseable JSON", "{not json"],
  ])("returns 400 for %s and changes nothing", async (_name, body) => {
    const before = getStore().read();

    const response = await post(body, asCustomer);

    expect(response.status).toBe(400);
    expect((await response.json()).status).toBe("invalid");
    expectMoneyUnchanged(before);
  });

  it("returns the fewest coins as change and takes them from the supply", async () => {
    const response = await post({ price: 65, amountPaid: 100 }, asCustomer);

    expect(response.status).toBe(200);
    expect(await response.json()).toEqual({
      status: "dispensed",
      change: { "20": 1, "10": 1, "5": 1 },
      changeTotal: 35,
    });
    const { supply, cashBox } = getStore().read();
    expect(supply).toEqual({ ...initialSupply(), 20: 9, 10: 9, 5: 9 });
    expect(cashBox).toBe(100);
  });

  it("refuses insufficient payment with 422 and changes nothing", async () => {
    const before = getStore().read();

    const response = await post({ price: 100, amountPaid: 99 }, asCustomer);

    expect(response.status).toBe(422);
    expect(await response.json()).toEqual({
      status: "refused",
      reason: "INSUFFICIENT_PAYMENT",
    });
    expectMoneyUnchanged(before);
  });

  it("refuses when exact change cannot be made with 422 and changes nothing", async () => {
    resetMachine({
      ...Object.fromEntries(COINS.map((coin) => [coin, 0])),
      2: 10,
    } as ReturnType<typeof initialSupply>);
    const before = getStore().read();

    const response = await post({ price: 99, amountPaid: 100 }, asCustomer);

    expect(response.status).toBe(422);
    expect(await response.json()).toEqual({
      status: "refused",
      reason: "CANNOT_MAKE_CHANGE",
    });
    expectMoneyUnchanged(before);
  });
});

describe("POST /api/purchase rate limiting", () => {
  const valid = { price: 65, amountPaid: 65 };

  it("allows three purchases then turns the fourth away with 429", async () => {
    for (let i = 0; i < 3; i++) {
      expect((await post(valid, asCustomer)).status).toBe(200);
    }

    const response = await post(valid, asCustomer);

    expect(response.status).toBe(429);
    expect(await response.json()).toEqual({
      status: "rate_limited",
      retryAfterMs: 3000,
    });
    expect(response.headers.get("Retry-After")).toBe("3");
  });

  it("lets the Customer back in once the oldest attempt has left the window", async () => {
    for (let i = 0; i < 3; i++) await post(valid, asCustomer);
    expect((await post(valid, asCustomer)).status).toBe(429);

    vi.setSystemTime(1_000_000 + 2999);
    expect((await post(valid, asCustomer)).status).toBe(429);

    vi.setSystemTime(1_000_000 + 3000);
    expect((await post(valid, asCustomer)).status).toBe(200);
  });

  it("keeps each Customer's limit independent", async () => {
    for (let i = 0; i < 3; i++) await post(valid, asCustomer);
    expect((await post(valid, asCustomer)).status).toBe(429);

    const other = await post(valid, { "X-Customer-Id": "customer-2" });

    expect(other.status).toBe(200);
  });

  it("turns the fourth attempt away before looking at the body", async () => {
    // Malformed attempts count, and the limiter runs before validation.
    for (let i = 0; i < 3; i++) {
      expect((await post({ price: 0.5 }, asCustomer)).status).toBe(400);
    }

    const response = await post({ price: 0.5 }, asCustomer);

    expect(response.status).toBe(429);
  });

  it("counts refused purchases too", async () => {
    for (let i = 0; i < 3; i++) {
      expect(
        (await post({ price: 100, amountPaid: 1 }, asCustomer)).status,
      ).toBe(422);
    }

    expect((await post(valid, asCustomer)).status).toBe(429);
  });

  it("does not extend the wait when a blocked Customer keeps trying", async () => {
    for (let i = 0; i < 3; i++) await post(valid, asCustomer);

    for (let i = 0; i < 5; i++) {
      vi.setSystemTime(1_000_000 + 500 * (i + 1));
      expect((await post(valid, asCustomer)).status).toBe(429);
    }

    vi.setSystemTime(1_000_000 + 3000);
    expect((await post(valid, asCustomer)).status).toBe(200);
  });

  it("does not touch the Coin Supply or Cash Box when rate limited", async () => {
    for (let i = 0; i < 3; i++) await post(valid, asCustomer);
    const before = getStore().read();

    await post({ price: 65, amountPaid: 200 }, asCustomer);

    const after = getStore().read();
    expect(after.supply).toBe(before.supply);
    expect(after.cashBox).toBe(before.cashBox);
  });

  it("does not count requests that fail identity", async () => {
    for (let i = 0; i < 5; i++) {
      expect((await post(valid)).status).toBe(401);
    }

    expect((await post(valid, asCustomer)).status).toBe(200);
  });
});

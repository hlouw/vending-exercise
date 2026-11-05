import { beforeEach, describe, expect, it } from "vitest";
import { COINS, initialSupply } from "@/lib/domain/coins";
import { POST } from "@/app/api/purchase/route";
import { getStore } from "@/lib/store";

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
    next: { ...state, supply, cashBox: 0 },
  }));
}

beforeEach(() => resetMachine());

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
    expect(getStore().read()).toBe(before);
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
    expect(getStore().read()).toBe(before);
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
    expect(getStore().read()).toBe(before);
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
    expect(getStore().read()).toBe(before);
  });
});

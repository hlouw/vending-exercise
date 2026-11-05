import { beforeEach, describe, expect, it, vi } from "vitest";
import { GET } from "@/app/api/stock/route";
import { POST } from "@/app/api/purchase/route";
import { COINS, initialSupply } from "@/lib/domain/coins";
import { StockResponseSchema } from "@/lib/schemas";
import { getStore } from "@/lib/store";

// `connection()` only works inside a real Next request. Whether the route is
// really dynamic is checked against a production build, not here.
vi.mock("next/server", () => ({ connection: async () => {} }));

beforeEach(() => {
  getStore().transact((state) => ({
    result: undefined,
    next: {
      ...state,
      supply: initialSupply(),
      cashBox: 0,
      attempts: new Map(),
    },
  }));
});

describe("GET /api/stock", () => {
  it("returns ten of each coin to begin with", async () => {
    const response = await GET();

    expect(response.status).toBe(200);
    const body = StockResponseSchema.parse(await response.json());
    expect(Object.keys(body.supply).sort()).toEqual(COINS.map(String).sort());
    expect(Object.values(body.supply).every((n) => n === 10)).toBe(true);
  });

  it("reflects change handed out by a purchase", async () => {
    await POST(
      new Request("http://localhost/api/purchase", {
        method: "POST",
        headers: { "X-Customer-Id": "customer-1" },
        body: JSON.stringify({ price: 65, amountPaid: 100 }),
      }),
    );

    const body = StockResponseSchema.parse(await (await GET()).json());
    expect(body.supply).toMatchObject({ "20": 9, "10": 9, "5": 9, "50": 10 });
  });

  it("never exposes the cash box", async () => {
    getStore().transact((state) => ({
      result: undefined,
      next: { ...state, cashBox: 12345 },
    }));

    const text = await (await GET()).text();

    expect(text).not.toContain("12345");
    expect(text.toLowerCase()).not.toContain("cash");
  });
});

import { describe, expect, it } from "vitest";
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
});

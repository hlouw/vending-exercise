import { describe, expect, it } from "vitest";
import {
  CustomerIdSchema,
  MAX_PENCE,
  PurchaseRequestSchema,
  PurchaseResponseSchema,
} from "@/lib/schemas";

describe("PurchaseRequestSchema", () => {
  it("accepts integer pence within range", () => {
    expect(
      PurchaseRequestSchema.safeParse({ price: 65, amountPaid: 65 }).success,
    ).toBe(true);
    expect(
      PurchaseRequestSchema.safeParse({ price: 1, amountPaid: MAX_PENCE })
        .success,
    ).toBe(true);
  });

  it.each([
    ["a float", { price: 0.65, amountPaid: 1 }],
    ["zero", { price: 0, amountPaid: 1 }],
    ["a negative", { price: 1, amountPaid: -5 }],
    ["over the maximum", { price: 1, amountPaid: MAX_PENCE + 1 }],
    ["a string", { price: "65", amountPaid: 65 }],
    ["a missing field", { price: 65 }],
    ["an extra key", { price: 65, amountPaid: 65, customerId: "x" }],
  ])("rejects %s", (_name, body) => {
    expect(PurchaseRequestSchema.safeParse(body).success).toBe(false);
  });

  it.each([undefined, null, "text", 42, []])("rejects %j", (body) => {
    expect(PurchaseRequestSchema.safeParse(body).success).toBe(false);
  });
});

describe("CustomerIdSchema", () => {
  it("accepts UUIDs and simple names", () => {
    expect(CustomerIdSchema.safeParse(crypto.randomUUID()).success).toBe(true);
    expect(CustomerIdSchema.safeParse("alice_1").success).toBe(true);
  });

  it.each([null, "", "   ", "a b", "x".repeat(65), "<script>"])(
    "rejects %j",
    (id) => {
      expect(CustomerIdSchema.safeParse(id).success).toBe(false);
    },
  );
});

describe("PurchaseResponseSchema", () => {
  it("parses a dispensed response", () => {
    expect(
      PurchaseResponseSchema.safeParse({
        status: "dispensed",
        change: {},
        changeTotal: 0,
      }).success,
    ).toBe(true);
  });

  it("rejects an unknown status", () => {
    expect(PurchaseResponseSchema.safeParse({ status: "nope" }).success).toBe(
      false,
    );
  });
});

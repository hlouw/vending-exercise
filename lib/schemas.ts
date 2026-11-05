import { z } from "zod";
import { COINS } from "@/lib/domain/coins";

/** The most the machine will consider, in pence (£100). */
export const MAX_PENCE = 10_000;

export const CustomerIdSchema = z
  .string()
  .trim()
  .min(1)
  .max(64)
  .regex(/^[A-Za-z0-9_-]+$/, "Letters, numbers, - and _ only");

const PenceSchema = z.int().min(1).max(MAX_PENCE);

export const PurchaseRequestSchema = z.strictObject({
  price: PenceSchema,
  amountPaid: PenceSchema,
});
export type PurchaseRequest = z.infer<typeof PurchaseRequestSchema>;

const CoinCountsSchema = z.partialRecord(
  z.enum(COINS.map(String) as [string, ...string[]]),
  z.int().nonnegative(),
);

export const PurchaseResponseSchema = z.discriminatedUnion("status", [
  z.object({
    status: z.literal("dispensed"),
    change: CoinCountsSchema,
    changeTotal: z.int().nonnegative(),
  }),
  z.object({
    status: z.literal("refused"),
    reason: z.enum(["INSUFFICIENT_PAYMENT", "CANNOT_MAKE_CHANGE"]),
  }),
  z.object({ status: z.literal("invalid"), issues: z.array(z.string()) }),
  z.object({ status: z.literal("unauthorized") }),
]);
export type PurchaseResponse = z.infer<typeof PurchaseResponseSchema>;

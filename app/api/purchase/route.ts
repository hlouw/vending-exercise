import { PurchaseRequestSchema } from "@/lib/schemas";
import { resolveCustomer } from "@/lib/server/resolveCustomer";
import { getStore } from "@/lib/server/store";
import { attemptPurchase, registerAttempt } from "@/lib/server/vending";

export async function POST(request: Request) {
  const customer = resolveCustomer(request);
  if (!customer.ok) {
    return Response.json({ status: "unauthorized" }, { status: 401 });
  }

  // Before the body is even read, so a Customer over their limit is turned
  // away without the price or the change being looked at.
  const limit = registerAttempt(getStore(), customer.customerId, Date.now());
  if (!limit.allowed) {
    return Response.json(
      { status: "rate_limited", retryAfterMs: limit.retryAfterMs },
      {
        status: 429,
        headers: {
          "Retry-After": String(Math.ceil(limit.retryAfterMs / 1000)),
        },
      },
    );
  }

  // Unparseable JSON becomes undefined, which validation then rejects.
  const body: unknown = await request.json().catch(() => undefined);
  const parsed = PurchaseRequestSchema.safeParse(body);
  if (!parsed.success) {
    return Response.json(
      { status: "invalid", issues: parsed.error.issues.map((i) => i.message) },
      { status: 400 },
    );
  }

  const outcome = attemptPurchase(getStore(), parsed.data);
  return Response.json(outcome, {
    status: outcome.status === "dispensed" ? 200 : 422,
  });
}

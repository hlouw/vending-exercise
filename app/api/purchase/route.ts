import { PurchaseRequestSchema } from "@/lib/schemas";
import { resolveCustomer } from "@/lib/server/resolveCustomer";
import { getStore } from "@/lib/store";
import { attemptPurchase } from "@/lib/vending";

export async function POST(request: Request) {
  if (!resolveCustomer(request).ok) {
    return Response.json({ status: "unauthorized" }, { status: 401 });
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

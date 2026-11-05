import { CUSTOMER_ID_HEADER } from "@/lib/identity-header";
import {
  PurchaseResponseSchema,
  type PurchaseRequest,
  type PurchaseResponse,
} from "@/lib/schemas";

export async function postPurchase(
  customerId: string,
  body: PurchaseRequest,
): Promise<PurchaseResponse> {
  const response = await fetch("/api/purchase", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      [CUSTOMER_ID_HEADER]: customerId,
    },
    body: JSON.stringify(body),
  });
  // Never trust the wire: parse, don't cast.
  return PurchaseResponseSchema.parse(await response.json());
}

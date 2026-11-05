import { CUSTOMER_ID_HEADER } from "@/lib/identity-header";
import {
  PurchaseResponseSchema,
  StockResponseSchema,
  type PurchaseRequest,
  type PurchaseResponse,
  type StockResponse,
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

export async function getStock(): Promise<StockResponse> {
  const response = await fetch("/api/stock", { cache: "no-store" });
  return StockResponseSchema.parse(await response.json());
}

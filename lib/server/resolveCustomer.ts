import { CUSTOMER_ID_HEADER } from "@/lib/identity-header";
import { CustomerIdSchema } from "@/lib/schemas";

/**
 * The server's only source of Customer Identity. Today it trusts a header the
 * client asserts. A real or fake login would read a session cookie or bearer
 * token here instead.
 */
export function resolveCustomer(
  request: Request,
): { ok: true; customerId: string } | { ok: false } {
  const parsed = CustomerIdSchema.safeParse(
    request.headers.get(CUSTOMER_ID_HEADER),
  );
  return parsed.success ? { ok: true, customerId: parsed.data } : { ok: false };
}

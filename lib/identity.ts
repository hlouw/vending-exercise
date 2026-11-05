import { CustomerIdSchema } from "@/lib/schemas";

const STORAGE_KEY = "vending.customerId";

/**
 * The only place a Customer Identity is produced on the client. A future
 * fake-login would replace this module's body (for example with a
 * user-selected ID) and nothing else.
 *
 * Browser only: call from event handlers or effects, never during render.
 */
export function getCustomerId(): string {
  const stored = CustomerIdSchema.safeParse(
    window.localStorage.getItem(STORAGE_KEY),
  );
  if (stored.success) return stored.data;

  const generated = crypto.randomUUID();
  window.localStorage.setItem(STORAGE_KEY, generated);
  return generated;
}

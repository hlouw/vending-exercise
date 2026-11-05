"use client";

import { useState } from "react";
import { Cluster } from "@/components/layout/Cluster";
import { Grid } from "@/components/layout/Grid";
import { Stack } from "@/components/layout/Stack";
import { Button } from "@/components/ui/Button";
import { postPurchase } from "@/lib/api";
import { CATALOGUE, type Item } from "@/lib/catalogue";
import { formatPence } from "@/lib/format";
import { getCustomerId } from "@/lib/identity";
import type { PurchaseResponse } from "@/lib/schemas";

function describe(item: Item, outcome: PurchaseResponse): string {
  switch (outcome.status) {
    case "dispensed":
      return `${item.name} dispensed. No change.`;
    case "refused":
      return `Refused: ${outcome.reason}`;
    case "invalid":
      return `Invalid request: ${outcome.issues.join(", ")}`;
    case "unauthorized":
      return "Unauthorised.";
  }
}

export function VendingMachine() {
  const [selected, setSelected] = useState<Item | null>(null);
  const [message, setMessage] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  // Exact payment only for now: the Amount Paid is the Price.
  const amountPaid = selected?.price ?? 0;

  async function buy() {
    if (!selected) return;
    setBusy(true);
    try {
      const outcome = await postPurchase(getCustomerId(), {
        price: selected.price,
        amountPaid,
      });
      setMessage(describe(selected, outcome));
    } catch {
      setMessage("Something went wrong. Please try again.");
    } finally {
      setBusy(false);
    }
  }

  return (
    <Stack gap="lg" className="mx-auto w-full max-w-3xl p-6">
      <h1 className="text-2xl font-semibold">Vending machine</h1>

      <Grid min="9rem">
        {CATALOGUE.map((item) => (
          <Button
            key={item.id}
            variant="item"
            size="lg"
            selected={selected?.id === item.id}
            onClick={() => {
              setSelected(item);
              setMessage(null);
            }}
          >
            <Stack gap="sm">
              <span>{item.name}</span>
              <span className="text-sm text-zinc-500">
                {formatPence(item.price)}
              </span>
            </Stack>
          </Button>
        ))}
      </Grid>

      <Cluster justify="between">
        <Stack gap="sm">
          <span>Price: {selected ? formatPence(selected.price) : "–"}</span>
          <span>Paying: {selected ? formatPence(amountPaid) : "–"}</span>
        </Stack>
        <Button onClick={buy} disabled={!selected || busy}>
          {busy ? "Buying…" : "Buy"}
        </Button>
      </Cluster>

      <p role="status" aria-live="polite" className="min-h-6">
        {message}
      </p>
    </Stack>
  );
}

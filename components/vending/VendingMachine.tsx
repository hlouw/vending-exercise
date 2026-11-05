"use client";

import { useState } from "react";
import { Grid } from "@/components/layout/Grid";
import { Stack } from "@/components/layout/Stack";
import { Button } from "@/components/ui/Button";
import { CoinTray, type TrayOutcome } from "@/components/vending/CoinTray";
import { PaymentPanel } from "@/components/vending/PaymentPanel";
import { postPurchase } from "@/lib/api";
import { CATALOGUE, type Item } from "@/lib/catalogue";
import { formatPence, parsePounds } from "@/lib/format";
import { getCustomerId } from "@/lib/identity";
import { MAX_PENCE } from "@/lib/schemas";

export function VendingMachine() {
  const [selected, setSelected] = useState<Item | null>(null);
  const [amountText, setAmountText] = useState("");
  const [outcome, setOutcome] = useState<TrayOutcome | null>(null);
  const [busy, setBusy] = useState(false);

  const parsed = parsePounds(amountText);
  const amountPaid =
    parsed !== null && parsed >= 1 && parsed <= MAX_PENCE ? parsed : null;
  const canBuy = selected !== null && amountPaid !== null && !busy;

  async function buy() {
    if (!selected || amountPaid === null) return;
    setBusy(true);
    try {
      const response = await postPurchase(getCustomerId(), {
        price: selected.price,
        amountPaid,
      });
      setOutcome({ kind: "response", itemName: selected.name, response });
      // A Refusal means the Customer keeps their money, so keep the amount
      // they entered. Once dispensed, the money has been spent.
      if (response.status === "dispensed") setAmountText("");
    } catch {
      setOutcome({ kind: "error" });
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
              setOutcome(null);
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

      <PaymentPanel
        price={selected?.price ?? null}
        amountText={amountText}
        amountPaid={amountPaid}
        onAmountTextChange={setAmountText}
        onQuickAdd={(pence) =>
          setAmountText(((parsed ?? 0) + pence) / 100 + "")
        }
        onClear={() => setAmountText("")}
      />

      <Button onClick={buy} disabled={!canBuy}>
        {busy ? "Buying…" : "Buy"}
      </Button>

      <CoinTray outcome={outcome} />
    </Stack>
  );
}

"use client";

import { useCallback, useEffect, useState } from "react";
import { Box } from "@/components/layout/Box";
import { Center } from "@/components/layout/Center";
import { Sidebar } from "@/components/layout/Sidebar";
import { Stack } from "@/components/layout/Stack";
import { CoinTray, type TrayOutcome } from "@/components/vending/CoinTray";
import { CustomerBadge } from "@/components/vending/CustomerBadge";
import { ItemGrid } from "@/components/vending/ItemGrid";
import { PaymentPanel } from "@/components/vending/PaymentPanel";
import { StockPanel } from "@/components/vending/StockPanel";
import { getStock, postPurchase } from "@/lib/api";
import type { Item } from "@/lib/catalogue";
import { parsePounds } from "@/lib/format";
import { getCustomerId } from "@/lib/identity";
import { MAX_PENCE, type StockResponse } from "@/lib/schemas";

export function VendingMachine() {
  const [selected, setSelected] = useState<Item | null>(null);
  const [amountText, setAmountText] = useState("");
  const [outcome, setOutcome] = useState<TrayOutcome | null>(null);
  const [busy, setBusy] = useState(false);
  const [stock, setStock] = useState<StockResponse | null>(null);

  const refreshStock = useCallback(async () => {
    try {
      setStock(await getStock());
    } catch {
      // Keep showing the last known stock; the next Purchase retries.
    }
  }, []);

  useEffect(() => {
    let cancelled = false;
    getStock()
      .then((initial) => {
        if (!cancelled) setStock(initial);
      })
      .catch(() => {
        // The next Purchase refreshes it.
      });
    return () => {
      cancelled = true;
    };
  }, []);

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
      // Whatever the Outcome, the Coin Supply may have changed.
      void refreshStock();
    }
  }

  return (
    <Center className="py-6">
      <Box tone="body" padding="lg">
        <Stack gap="lg">
          <header>
            <h1 className="text-3xl font-bold tracking-tight">
              Vending machine
            </h1>
            <p className="text-machine-trim">
              Pick an item, pay, and get your change.
            </p>
          </header>

          <Sidebar sidebarWidth="19rem">
            <Box tone="glass" padding="lg">
              <ItemGrid
                selectedId={selected?.id ?? null}
                onSelect={(item) => {
                  setSelected(item);
                  setOutcome(null);
                }}
              />
            </Box>
            <Stack gap="md">
              <Box tone="panel">
                <PaymentPanel
                  price={selected?.price ?? null}
                  amountText={amountText}
                  amountPaid={amountPaid}
                  canBuy={canBuy}
                  busy={busy}
                  onAmountTextChange={setAmountText}
                  onQuickAdd={(pence) =>
                    setAmountText(((parsed ?? 0) + pence) / 100 + "")
                  }
                  onClear={() => setAmountText("")}
                  onBuy={buy}
                />
              </Box>
              <Box tone="panel">
                <StockPanel stock={stock} />
              </Box>
            </Stack>
          </Sidebar>

          <CoinTray outcome={outcome} />

          <Box tone="panel">
            <CustomerBadge />
          </Box>
        </Stack>
      </Box>
    </Center>
  );
}

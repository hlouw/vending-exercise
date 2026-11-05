"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { Box } from "@/components/layout/Box";
import { Center } from "@/components/layout/Center";
import { Cluster } from "@/components/layout/Cluster";
import { Stack } from "@/components/layout/Stack";
import { CoinTray } from "@/components/vending/CoinTray";
import { CustomerBadge } from "@/components/vending/CustomerBadge";
import { ItemGrid } from "@/components/vending/ItemGrid";
import {
  changeCoinsOf,
  OutcomeMessage,
  type DisplayedOutcome,
} from "@/components/vending/OutcomeMessage";
import { PaymentPanel } from "@/components/vending/PaymentPanel";
import { StockPanel } from "@/components/vending/StockPanel";
import { getStock, postPurchase } from "@/lib/client/api";
import type { Item } from "@/lib/catalogue";
import { parsePounds } from "@/lib/format";
import { getCustomerId } from "@/lib/client/identity";
import { MAX_PENCE, type StockResponse } from "@/lib/schemas";

export function VendingMachine() {
  const [selected, setSelected] = useState<Item | null>(null);
  const [amountText, setAmountText] = useState("");
  const [outcome, setOutcome] = useState<DisplayedOutcome | null>(null);
  const [busy, setBusy] = useState(false);
  const [stock, setStock] = useState<StockResponse | null>(null);
  const resultRef = useRef<HTMLDivElement>(null);

  // On a small screen the result can be below the fold when Buy is pressed.
  // "nearest" does nothing when it is already fully visible.
  useEffect(() => {
    if (outcome) resultRef.current?.scrollIntoView({ block: "nearest" });
  }, [outcome]);

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
    <Center className="py-4">
      <Box tone="body">
        <Stack gap="md">
          <Cluster justify="between" align="end" gap="sm">
            <h1 className="text-xl font-semibold">Vending machine</h1>
            <CustomerBadge />
          </Cluster>

          {/*
            Two columns from md up. Below that the column wrappers dissolve and
            the panels are reordered, so the result sits right under Buy, where
            the Customer is looking when the Outcome appears.
          */}
          <div className="flex flex-col gap-3 md:flex-row">
            <div className="flex flex-col gap-3 max-md:contents md:min-w-0 md:flex-1">
              <Box tone="glass" padding="sm" className="max-md:order-1">
                <ItemGrid
                  selectedId={selected?.id ?? null}
                  onSelect={(item) => {
                    setSelected(item);
                    setOutcome(null);
                  }}
                />
              </Box>
              <div
                ref={resultRef}
                className="flex flex-col gap-3 max-md:order-3 md:flex-1"
              >
                <OutcomeMessage outcome={outcome} />
                <CoinTray
                  change={changeCoinsOf(outcome)}
                  className="md:flex-1"
                />
              </div>
            </div>
            <div className="flex flex-col gap-3 max-md:contents md:w-64 md:shrink-0">
              <Box tone="panel" padding="sm" className="max-md:order-2">
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
              <Box tone="panel" padding="sm" className="max-md:order-4">
                <StockPanel stock={stock} />
              </Box>
            </div>
          </div>
        </Stack>
      </Box>
    </Center>
  );
}

export interface Item {
  id: string;
  /** What is printed above the slot, like A1. */
  slot: string;
  name: string;
  /** Pence. */
  price: number;
}

export const CATALOGUE: readonly Item[] = [
  { id: "mints", slot: "A1", name: "Mints", price: 65 },
  { id: "crisps", slot: "A2", name: "Crisps", price: 90 },
  { id: "chocolate", slot: "A3", name: "Chocolate", price: 135 },
  { id: "biscuits", slot: "B1", name: "Biscuits", price: 180 },
  { id: "sandwich", slot: "B2", name: "Sandwich", price: 245 },
  { id: "smoothie", slot: "B3", name: "Smoothie", price: 320 },
];

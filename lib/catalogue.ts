export interface Item {
  id: string;
  name: string;
  /** Pence. */
  price: number;
}

export const CATALOGUE: readonly Item[] = [
  { id: "mints", name: "Mints", price: 65 },
  { id: "crisps", name: "Crisps", price: 90 },
  { id: "chocolate", name: "Chocolate", price: 135 },
  { id: "biscuits", name: "Biscuits", price: 180 },
  { id: "sandwich", name: "Sandwich", price: 245 },
  { id: "smoothie", name: "Smoothie", price: 320 },
];

export interface Item {
  id: string;
  /** What is printed above the slot, like A1. */
  slot: string;
  name: string;
  /** A picture of the item. Decorative: the name carries the meaning. */
  emoji: string;
  /** Pence. */
  price: number;
}

export const CATALOGUE: readonly Item[] = [
  { id: "mints", slot: "A1", name: "Mints", emoji: "🍬", price: 65 },
  { id: "crisps", slot: "A2", name: "Crisps", emoji: "🥔", price: 90 },
  { id: "chocolate", slot: "A3", name: "Chocolate", emoji: "🍫", price: 135 },
  { id: "biscuits", slot: "B1", name: "Biscuits", emoji: "🍪", price: 180 },
  { id: "sandwich", slot: "B2", name: "Sandwich", emoji: "🥪", price: 245 },
  { id: "smoothie", slot: "B3", name: "Smoothie", emoji: "🥤", price: 320 },
];

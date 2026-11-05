/** 135 -> "£1.35" */
export function formatPence(pence: number): string {
  return `£${(pence / 100).toFixed(2)}`;
}

/** 50 -> "50p", 200 -> "£2" */
export function formatCoin(coin: number): string {
  return coin >= 100 ? `£${coin / 100}` : `${coin}p`;
}

/**
 * Parses what a Customer typed ("1.50", "2", "0.5") into pence.
 * Returns null for anything that is not a plain amount of pounds.
 */
export function parsePounds(text: string): number | null {
  const trimmed = text.trim();
  if (!/^\d+(\.\d{1,2})?$/.test(trimmed)) return null;
  return Math.round(Number(trimmed) * 100);
}

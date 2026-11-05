import { describe, expect, it } from "vitest";
import { formatCoin, formatPence, parsePounds } from "@/lib/format";

describe("format", () => {
  it("formats pence as pounds", () => {
    expect(formatPence(135)).toBe("£1.35");
    expect(formatPence(5)).toBe("£0.05");
  });

  it("formats coins", () => {
    expect(formatCoin(1)).toBe("1p");
    expect(formatCoin(50)).toBe("50p");
    expect(formatCoin(100)).toBe("£1");
    expect(formatCoin(200)).toBe("£2");
  });

  it.each([
    ["1.50", 150],
    ["2", 200],
    ["0.5", 50],
    ["0.05", 5],
    [" 3.20 ", 320],
  ])("parses %j as %i pence", (text, pence) => {
    expect(parsePounds(text)).toBe(pence);
  });

  it.each(["", "abc", "-1", "1.234", "1,50", "£1", "1."])(
    "rejects %j",
    (text) => {
      expect(parsePounds(text)).toBeNull();
    },
  );
});

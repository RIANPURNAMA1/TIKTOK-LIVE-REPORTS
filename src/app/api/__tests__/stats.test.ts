import { describe, it, expect } from "vitest";

// Test the helper functions from stats/route.ts
function parseToNum(s: string | null | undefined): number {
  if (!s) return 0;
  const clean = String(s).trim().toLowerCase().replace(/,/g, "");
  if (clean.endsWith("k")) return Math.round(parseFloat(clean) * 1000);
  if (clean.endsWith("m")) return Math.round(parseFloat(clean) * 1_000_000);
  return parseInt(clean) || 0;
}

function formatNum(n: number): string {
  if (n >= 1_000_000) return `${(n / 1_000_000).toFixed(1)}M`;
  if (n >= 1_000) return `${(n / 1_000).toFixed(1)}K`;
  return n.toString();
}

describe("parseToNum", () => {
  it.each([
    ["18.8K", 18800],
    ["1.2M", 1200000],
    ["500", 500],
    ["0", 0],
    [null, 0],
    [undefined, 0],
    ["", 0],
    ["1,500", 1500],
  ])("parses '%s' to %d", (input, expected) => {
    expect(parseToNum(input)).toBe(expected);
  });
});

describe("formatNum", () => {
  it.each([
    [18800, "18.8K"],
    [1200000, "1.2M"],
    [500, "500"],
    [0, "0"],
    [1000, "1.0K"],
    [999, "999"],
    [1000000, "1.0M"],
  ])("formats %d to '%s'", (input, expected) => {
    expect(formatNum(input)).toBe(expected);
  });
});

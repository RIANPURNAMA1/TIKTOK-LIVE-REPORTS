import { describe, it, expect } from "vitest";
import { parseNumericValue, formatDisplayNumber, parseTikTokLiveData } from "../parseOCR";

describe("parseNumericValue", () => {
  it.each([
    ["0", 0],
    ["123", 123],
    ["1,500", 1500],
    ["18.8K", 18800],
    ["1.2M", 1200000],
    ["500k", 500000],
    ["2.5k", 2500],
    ["", 0],
    ["abc", 0],
  ])("parses '%s' to %d", (input, expected) => {
    expect(parseNumericValue(input)).toBe(expected);
  });
});

describe("formatDisplayNumber", () => {
  it.each([
    [0, "0"],
    [500, "500"],
    [18800, "18.8K"],
    [1200000, "1.2M"],
    [2500, "2.5K"],
    [999, "999"],
    [1000, "1.0K"],
    [1000000, "1.0M"],
  ])("formats %d to '%s'", (input, expected) => {
    expect(formatDisplayNumber(input)).toBe(expected);
  });
});

describe("parseTikTokLiveData", () => {
  it("returns default values for empty input", () => {
    const result = parseTikTokLiveData("");
    expect(result).toEqual({
      tayangan: "0",
      berlian: 0,
      durasi_live: "0 jam",
      pemberi_hadiah: 0,
      pengikut_baru: 0,
      komentar: "0",
    });
  });

  it("parses complete valid data", () => {
    const text = [
      "18.8K",
      "tayangan",
      "245000",
      "berlian",
      "2",
      "jam",
      "89",
      "pemberi hadiah",
      "120",
      "pengikut baru",
      "1.2K",
      "komentar",
    ].join("\n");

    const result = parseTikTokLiveData(text);
    expect(result.tayangan).toBe("18.8K");
    expect(result.berlian).toBe(245000);
    expect(result.durasi_live).toBe("2 jam");
    expect(result.pemberi_hadiah).toBe(89);
    expect(result.pengikut_baru).toBe(120);
    expect(result.komentar).toBe("1.2K");
  });

  it("falls back to regex when line order is different", () => {
    const text = "18.8K tayangan\n245000 berlian\n2 jam durasi\n89 pemberi\n120 pengikut baru\n1.2K komentar";
    const result = parseTikTokLiveData(text);
    expect(result.tayangan).toBe("18.8K");
    expect(result.berlian).toBe(245000);
    expect(result.durasi_live).toBe("2 jam");
    expect(result.pemberi_hadiah).toBe(89);
    expect(result.pengikut_baru).toBe(120);
    expect(result.komentar).toBe("1.2K");
  });

  it("handles partial data", () => {
    const text = "10K tayangan\n500 komentar";
    const result = parseTikTokLiveData(text);
    expect(result.tayangan).toBe("10K");
    expect(result.berlian).toBe(0);
    expect(result.durasi_live).toBe("0 jam");
    expect(result.pemberi_hadiah).toBe(0);
    expect(result.pengikut_baru).toBe(0);
    expect(result.komentar).toBe("500");
  });

  it("handles 'jam' on a separate line", () => {
    const text = ["3", "jam", "tayangan 15K"].join("\n");
    const result = parseTikTokLiveData(text);
    expect(result.durasi_live).toBe("3 jam");
  });
});

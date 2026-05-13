import { describe, it, expect } from "vitest";
import { formatDate, formatNumber } from "./format";

describe("formatDate", () => {
  it("formats Date", () => {
    const s = formatDate(new Date("2025-01-15"));
    expect(s).toMatch(/Jan|January/);
    expect(s).toMatch(/15/);
    expect(s).toMatch(/2025/);
  });

  it("formats string date", () => {
    const s = formatDate("2025-01-15");
    expect(s.length).toBeGreaterThan(0);
  });
});

describe("formatNumber", () => {
  it("formats number", () => {
    const s = formatNumber(1234.5, "en");
    expect(s).toMatch(/\d/);
    expect(typeof s).toBe("string");
  });
});

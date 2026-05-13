import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { renderHook } from "@testing-library/react";
import { useMediaQuery } from "./useMediaQuery";

describe("useMediaQuery", () => {
  const addEventListener = vi.fn();
  const removeEventListener = vi.fn();

  beforeEach(() => {
    vi.stubGlobal("window", {
      matchMedia: vi.fn((query: string) => ({
        matches: query === "(min-width: 768px)",
        media: query,
        addEventListener,
        removeEventListener,
        dispatchEvent: vi.fn(),
        onchange: null,
        addListener: vi.fn(),
        removeListener: vi.fn(),
      })),
    });
  });

  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it("returns true when query matches", () => {
    const { result } = renderHook(() => useMediaQuery("(min-width: 768px)"));
    expect(result.current).toBe(true);
  });

  it("returns false when query does not match", () => {
    const { result } = renderHook(() => useMediaQuery("(max-width: 400px)"));
    expect(result.current).toBe(false);
  });
});

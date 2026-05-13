import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { renderHook, act } from "@testing-library/react";
import { useDebounce } from "./useDebounce";

describe("useDebounce", () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it("returns initial value immediately", () => {
    const { result } = renderHook(() => useDebounce("hello", 100));
    expect(result.current).toBe("hello");
  });

  it("updates after delay", () => {
    const { result, rerender } = renderHook(
      ({ value, delay }) => useDebounce(value, delay),
      { initialProps: { value: "first", delay: 100 } }
    );

    expect(result.current).toBe("first");

    rerender({ value: "second", delay: 100 });
    expect(result.current).toBe("first");

    act(() => {
      vi.advanceTimersByTime(100);
    });
    expect(result.current).toBe("second");
  });
});

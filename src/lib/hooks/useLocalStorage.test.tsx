import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { renderHook, act } from "@testing-library/react";
import { useLocalStorage } from "./useLocalStorage";

describe("useLocalStorage", () => {
  const getItem = vi.fn();
  const setItem = vi.fn();

  beforeEach(() => {
    vi.stubGlobal("window", {
      localStorage: {
        getItem,
        setItem,
        removeItem: vi.fn(),
        clear: vi.fn(),
        length: 0,
        key: vi.fn(),
      },
    });
    getItem.mockReturnValue(null);
    setItem.mockClear();
    getItem.mockClear();
  });

  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it("returns initial value when storage is empty", () => {
    const { result } = renderHook(() => useLocalStorage("key", "initial"));
    expect(result.current[0]).toBe("initial");
    expect(getItem).toHaveBeenCalledWith("key");
  });

  it("returns parsed value from storage when present", () => {
    getItem.mockReturnValue(JSON.stringify("stored"));
    const { result } = renderHook(() => useLocalStorage("key", "initial"));
    expect(result.current[0]).toBe("stored");
  });

  it("updates state and storage when setValue is called", () => {
    const { result } = renderHook(() => useLocalStorage("key", "initial"));

    act(() => {
      result.current[1]("updated");
    });

    expect(result.current[0]).toBe("updated");
    expect(setItem).toHaveBeenCalledWith("key", JSON.stringify("updated"));
  });
});

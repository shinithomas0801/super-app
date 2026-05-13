import { describe, it, expect } from "vitest";
import { cn } from "@/lib/utils";

describe("cn", () => {
  it("joins string classes", () => {
    expect(cn("a", "b")).toBe("a b");
  });

  it("filters falsy values", () => {
    expect(cn("a", undefined, null, false, "b")).toBe("a b");
  });

  it("handles arrays", () => {
    expect(cn(["a", "b"])).toBe("a b");
  });
});

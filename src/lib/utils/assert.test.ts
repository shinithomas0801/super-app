import { describe, it, expect } from "vitest";
import { assert, assertDefined } from "./assert";

describe("assert", () => {
  it("does not throw when condition is truthy", () => {
    expect(() => assert(true)).not.toThrow();
    expect(() => assert(1)).not.toThrow();
    expect(() => assert("ok")).not.toThrow();
  });

  it("throws when condition is falsy", () => {
    expect(() => assert(false)).toThrow("Assertion failed");
    expect(() => assert(0)).toThrow("Assertion failed");
    expect(() => assert(null)).toThrow("Assertion failed");
    expect(() => assert(false, "Custom message")).toThrow("Custom message");
  });
});

describe("assertDefined", () => {
  it("does not throw when value is defined", () => {
    expect(() => assertDefined(0)).not.toThrow();
    expect(() => assertDefined("")).not.toThrow();
    expect(() => assertDefined({})).not.toThrow();
  });

  it("throws when value is null or undefined", () => {
    expect(() => assertDefined(null)).toThrow("Expected value to be defined");
    expect(() => assertDefined(undefined)).toThrow("Expected value to be defined");
    expect(() => assertDefined(undefined, "Required")).toThrow("Required");
  });
});

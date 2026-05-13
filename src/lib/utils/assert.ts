/**
 * Assertion helpers (Single Responsibility: invariants)
 */

export function assert(
  condition: unknown,
  message: string = "Assertion failed"
): asserts condition {
  if (!condition) {
    throw new Error(message);
  }
}

export function assertDefined<T>(
  value: T | null | undefined,
  message: string = "Expected value to be defined"
): asserts value is T {
  if (value === null || value === undefined) {
    throw new Error(message);
  }
}

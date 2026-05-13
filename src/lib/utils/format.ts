/**
 * Formatting utilities (Single Responsibility: presentational only)
 */

export function formatDate(
  value: Date | string | number,
  locale: string = "en",
  options: Intl.DateTimeFormatOptions = {
    dateStyle: "medium",
  }
): string {
  const date = typeof value === "object" ? value : new Date(value);
  return new Intl.DateTimeFormat(locale, options).format(date);
}

export function formatNumber(
  value: number,
  locale: string = "en",
  options?: Intl.NumberFormatOptions
): string {
  return new Intl.NumberFormat(locale, options).format(value);
}

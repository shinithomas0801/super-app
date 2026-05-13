/**
 * i18n config (Single Responsibility). Expand with more locales as needed.
 */

export const defaultLocale = "en" as const;
export const locales = ["en"] as const;
export type Locale = (typeof locales)[number];
export const defaultTimeZone = "UTC" as const;

export const localeNames: Record<Locale, string> = {
  en: "English",
};

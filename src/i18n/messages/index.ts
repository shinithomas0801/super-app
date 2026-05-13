import type { AbstractIntlMessages } from "use-intl";
import type { Locale } from "../config";
import en from "./en.json";

export const messages: Record<Locale, AbstractIntlMessages> = {
  en: en as AbstractIntlMessages,
};

export function getMessages(locale: Locale): AbstractIntlMessages {
  return messages[locale] ?? messages.en;
}

"use client";

import { NextIntlClientProvider } from "next-intl";
import type { AbstractIntlMessages } from "use-intl";
import { defaultTimeZone } from "@/i18n";

interface ProvidersProps {
  children: React.ReactNode;
  messages: AbstractIntlMessages;
  locale?: string;
}

/**
 * Client-only providers. Dependency inversion: app depends on abstractions (Query, Intl).
 */
export function Providers({
  children,
  messages,
  locale = "en",
}: ProvidersProps) {
  return (
    <NextIntlClientProvider
      locale={locale}
      messages={messages}
      timeZone={defaultTimeZone}
    >
      {children}
    </NextIntlClientProvider>
  );
}

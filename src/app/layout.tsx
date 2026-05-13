import type { Metadata } from "next";
import { getMessages, defaultLocale } from "@/i18n";
import { GlobalSignOutButton } from "@/presentation/features/auth/components/GlobalSignOutButton";
import { Providers } from "./providers";
import "./globals.css";

export const metadata: Metadata = {
  title: "Users – Clean Architecture Template",
  description: "Next.js + Clean Architecture + Container–Presenter",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const messages = getMessages(defaultLocale);
  return (
    <html lang={defaultLocale}>
      <body className="antialiased">
        <Providers messages={messages} locale={defaultLocale}>
          <GlobalSignOutButton />
          {children}
        </Providers>
      </body>
    </html>
  );
}

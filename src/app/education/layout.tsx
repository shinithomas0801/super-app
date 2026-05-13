import type { Metadata } from "next";
import { EducationShell } from "@/presentation/features/education/shared/components";

export const metadata: Metadata = {
  title: "Education admin",
  description:
    "Super-app admin module for international education operations, AI audits, and counseling workflows.",
};

export default function EducationLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return <EducationShell>{children}</EducationShell>;
}

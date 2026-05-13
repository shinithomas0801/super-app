"use client";

import { usePathname } from "next/navigation";
import { ROUTES } from "@/lib/constants";
import { SignOutButton } from "./SignOutButton";

export function GlobalSignOutButton() {
  const pathname = usePathname();

  if (
    pathname === ROUTES.HOME ||
    pathname === ROUTES.LOGIN ||
    pathname?.startsWith(ROUTES.EDUCATION)
  ) {
    return null;
  }

  return (
    <SignOutButton className="fixed right-4 top-4 z-50 rounded-md border border-gray-300 bg-white px-3 py-1.5 text-xs font-medium text-gray-700 shadow-sm hover:bg-gray-50" />
  );
}

"use client";

import Link from "next/link";
import { SignOutButton } from "@/presentation/features/auth/components/SignOutButton";
import { ROUTES } from "@/lib/constants";

export function EducationNavbar() {
  return (
    <header className="flex h-14 shrink-0 items-center justify-between gap-4 border-b border-gray-200 bg-white px-4 shadow-sm lg:px-6">
      <div className="flex min-w-0 items-center gap-3">
        <Link
          href={ROUTES.HOME}
          className="text-sm font-semibold text-gray-900 hover:text-gray-700"
        >
          Admin
        </Link>
        <span className="text-gray-300 select-none" aria-hidden>
          /
        </span>
        <Link
          href={ROUTES.EDUCATION}
          className="truncate text-sm font-medium text-gray-600 hover:text-gray-900"
        >
          Education
        </Link>
      </div>
      <SignOutButton className="shrink-0 rounded-md border border-gray-300 bg-white px-3 py-1.5 text-xs font-medium text-gray-700 hover:bg-gray-50" />
    </header>
  );
}

import type { ReactNode } from "react";
import { EducationNavbar } from "./EducationNavbar";
import { EducationSideNav } from "./EducationSideNav";

export function EducationShell({ children }: { children: ReactNode }) {
  return (
    <div className="flex h-[100dvh] min-h-0 flex-col overflow-hidden bg-white">
      <EducationNavbar />
      <div className="flex min-h-0 flex-1">
        <EducationSideNav />
        <div className="min-h-0 flex-1 overflow-y-auto">
          <div className="mx-auto max-w-6xl p-6 lg:p-10">{children}</div>
        </div>
      </div>
    </div>
  );
}

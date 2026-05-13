"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { ROUTES } from "@/lib/constants";
import { cn } from "@/lib/utils";

const sections: {
  title: string;
  items: { href: string; label: string }[];
}[] = [
  {
    title: "Overview",
    items: [{ href: ROUTES.EDUCATION, label: "Dashboard" }],
  },
  {
    title: "Student data",
    items: [
      { href: ROUTES.EDUCATION_STUDENTS, label: "Profiles & academics" },
      { href: ROUTES.EDUCATION_MARK_LISTS, label: "Mark list uploads" },
      { href: ROUTES.EDUCATION_EXAMS, label: "Exam scores" },
    ],
  },
  {
    title: "Catalog",
    items: [
      { href: ROUTES.EDUCATION_UNIVERSITIES, label: "Universities" },
      { href: ROUTES.EDUCATION_COURSES, label: "Courses" },
      { href: ROUTES.EDUCATION_INTAKES, label: "Intake timelines" },
      { href: ROUTES.EDUCATION_FILTERS, label: "Filters & countries" },
    ],
  },
  {
    title: "Guidance",
    items: [
      { href: ROUTES.EDUCATION_SCHOLARSHIPS, label: "Scholarships" },
      { href: ROUTES.EDUCATION_VISA, label: "Visa checklist" },
      { href: ROUTES.EDUCATION_COSTS, label: "Cost calculator" },
    ],
  },
  {
    title: "Insights",
    items: [{ href: ROUTES.EDUCATION_ANALYTICS, label: "Analytics" }],
  },
];

export function EducationSideNav() {
  const pathname = usePathname();

  return (
    <aside className="flex h-full w-64 shrink-0 flex-col overflow-y-auto border-r border-gray-200 bg-gray-50/80 p-4">
      <Link
        href={ROUTES.EDUCATION}
        className="block px-2 mb-6 text-sm font-semibold tracking-tight text-gray-900"
      >
        Education admin
      </Link>
      <nav className="space-y-6">
        {sections.map((section) => (
          <div key={section.title}>
            <p className="px-2 text-xs font-semibold uppercase tracking-wider text-gray-500 mb-2">
              {section.title}
            </p>
            <ul className="space-y-0.5">
              {section.items.map((item) => {
                const active =
                  pathname === item.href ||
                  (item.href === ROUTES.EDUCATION_UNIVERSITIES &&
                    pathname.startsWith(`${ROUTES.EDUCATION_UNIVERSITIES}/`)) ||
                  (item.href === ROUTES.EDUCATION_COURSES &&
                    pathname.startsWith(`${ROUTES.EDUCATION_COURSES}/`)) ||
                  (item.href === ROUTES.EDUCATION_INTAKES &&
                    pathname.startsWith(`${ROUTES.EDUCATION_INTAKES}/`));
                return (
                  <li key={item.href}>
                    <Link
                      href={item.href}
                      className={cn(
                        "block rounded-md px-2 py-1.5 text-sm transition-colors",
                        active
                          ? "bg-white text-gray-900 shadow-sm ring-1 ring-gray-200"
                          : "text-gray-600 hover:bg-white hover:text-gray-900"
                      )}
                    >
                      {item.label}
                    </Link>
                  </li>
                );
              })}
            </ul>
          </div>
        ))}
      </nav>
    </aside>
  );
}

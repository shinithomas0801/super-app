import Link from "next/link";
import type { EducationDashboardCounts } from "@/domain/education";
import { ROUTES } from "@/lib/constants";

function StatCard({
  label,
  value,
  href,
}: {
  label: string;
  value: number;
  href?: string;
}) {
  const inner = (
    <>
      <p className="text-sm font-medium text-gray-500">{label}</p>
      <p className="mt-2 text-3xl font-semibold tabular-nums text-gray-900">
        {value}
      </p>
    </>
  );

  if (href) {
    return (
      <Link
        href={href}
        className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm transition hover:border-gray-300 hover:shadow"
      >
        {inner}
      </Link>
    );
  }

  return (
    <div className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm">
      {inner}
    </div>
  );
}

type Props = {
  counts: EducationDashboardCounts;
};

export function EducationDashboardPresenter({ counts }: Props) {
  return (
    <div>
      <div className="mb-8">
        <h1 className="text-2xl font-bold tracking-tight text-gray-900">
          Education operations
        </h1>
        <p className="mt-2 max-w-2xl text-sm text-gray-600">
          Catalog, student records, scholarship guidance, and counseling
          workflows. Data is protected by Supabase RLS for users listed in{" "}
          <code className="rounded bg-gray-100 px-1 py-0.5 text-xs">
            admin_users
          </code>
          .
        </p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard
          label="Countries"
          value={counts.countries}
          href={ROUTES.EDUCATION_FILTERS}
        />
        <StatCard
          label="Universities"
          value={counts.universities}
          href={ROUTES.EDUCATION_UNIVERSITIES}
        />
        <StatCard
          label="Courses"
          value={counts.courses}
          href={ROUTES.EDUCATION_COURSES}
        />
        <StatCard
          label="Student profiles"
          value={counts.students}
          href={ROUTES.EDUCATION_STUDENTS}
        />
        <StatCard
          label="Scholarships"
          value={counts.scholarships}
          href={ROUTES.EDUCATION_SCHOLARSHIPS}
        />
        <StatCard
          label="Mark uploads pending"
          value={counts.markUploadsPending}
          href={ROUTES.EDUCATION_MARK_LISTS}
        />
      </div>

      <div className="mt-10 grid gap-6 lg:grid-cols-2">
        <div className="rounded-xl border border-gray-200 bg-gray-50/80 p-6">
          <h2 className="text-sm font-semibold text-gray-900">Design notes</h2>
          <ul className="mt-3 list-disc space-y-2 pl-5 text-sm text-gray-600">
            <li>
              Student PII and documents stay in Postgres + private Storage; mark
              lists use bucket{" "}
              <code className="rounded bg-white px-1 text-xs">
                education-mark-lists
              </code>
              .
            </li>
            <li>
              Keep country, university, and course catalogs in sync to support
              counselor operations and student progression.
            </li>
          </ul>
        </div>
        <div className="rounded-xl border border-gray-200 bg-gray-50/80 p-6">
          <h2 className="text-sm font-semibold text-gray-900">Quick links</h2>
          <div className="mt-3 flex flex-wrap gap-2">
            {[
              ["Visa content", ROUTES.EDUCATION_VISA],
              ["Cost benchmarks", ROUTES.EDUCATION_COSTS],
              ["Analytics", ROUTES.EDUCATION_ANALYTICS],
            ].map(([label, href]) => (
              <Link
                key={href}
                href={href}
                className="rounded-full bg-white px-3 py-1 text-xs font-medium text-gray-700 ring-1 ring-gray-200 hover:bg-gray-50"
              >
                {label}
              </Link>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

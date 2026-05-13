"use client";

import Link from "next/link";
import type { ScholarshipRow, VisaChecklistRow } from "@/domain/education";
import { ROUTES } from "@/lib/constants";

function trunc(s: string | null, max: number) {
  if (!s) return "—";
  return s.length <= max ? s : `${s.slice(0, max)}…`;
}

function scholarshipScopeLabel(row: ScholarshipRow, courseId?: string): string {
  if (courseId) {
    if (row.course_id === courseId) return "This course";
    if (!row.course_id) return "University-wide";
    return row.course_name ?? row.course_id;
  }
  return row.course_name ?? (row.course_id ? "Specific course" : "All courses");
}

type Props = {
  scholarships: ScholarshipRow[];
  visaChecklist: VisaChecklistRow[];
  /** When set (course detail), scope labels compare to this course id. */
  courseId?: string;
};

export function EducationDetailGuidanceBlocks({
  scholarships,
  visaChecklist,
  courseId,
}: Props) {
  if (scholarships.length === 0 && visaChecklist.length === 0) return null;

  return (
    <div className="space-y-8">
      {scholarships.length > 0 ? (
        <section className="rounded-lg border border-gray-200 bg-white p-5 shadow-sm">
          <div className="flex flex-wrap items-baseline justify-between gap-2">
            <h2 className="text-lg font-semibold text-gray-900">
              Scholarships
            </h2>
            <Link
              href={ROUTES.EDUCATION_SCHOLARSHIPS}
              className="text-sm text-blue-700 underline hover:text-blue-900"
            >
              Manage scholarships
            </Link>
          </div>
          <p className="mt-1 text-sm text-gray-600">
            {courseId
              ? "Scholarships for this course or university-wide for the host institution."
              : "Scholarships linked to this university in the catalog."}
          </p>
          <div className="mt-4 overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200 text-sm">
              <thead>
                <tr className="text-left text-xs font-medium uppercase tracking-wide text-gray-500">
                  <th className="pb-2 pr-4">Name</th>
                  <th className="pb-2 pr-4">Scope</th>
                  <th className="pb-2 pr-4">Amount</th>
                  <th className="pb-2 pr-4">Deadline</th>
                  <th className="pb-2">Eligibility</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {scholarships.map((r) => (
                  <tr key={r.id} className="align-top text-gray-900">
                    <td className="py-2 pr-4 font-medium">{r.name}</td>
                    <td className="py-2 pr-4 text-gray-700">
                      {scholarshipScopeLabel(r, courseId)}
                    </td>
                    <td className="py-2 pr-4">{r.amount ?? "—"}</td>
                    <td className="py-2 pr-4 whitespace-nowrap">
                      {r.deadline ?? "—"}
                    </td>
                    <td className="py-2 text-gray-600">
                      {trunc(r.eligibility, 80)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>
      ) : null}

      {visaChecklist.length > 0 ? (
        <section className="rounded-lg border border-gray-200 bg-white p-5 shadow-sm">
          <div className="flex flex-wrap items-baseline justify-between gap-2">
            <h2 className="text-lg font-semibold text-gray-900">
              Visa checklist
            </h2>
            <Link
              href={ROUTES.EDUCATION_VISA}
              className="text-sm text-blue-700 underline hover:text-blue-900"
            >
              Manage checklist
            </Link>
          </div>
          <p className="mt-1 text-sm text-gray-600">
            {courseId
              ? "Documents for the country where the host university is based."
              : "Documents for the country where this university is based."}
          </p>
          <ol className="mt-4 list-none space-y-3 p-0">
            {visaChecklist.map((r, index) => (
              <li
                key={r.id}
                className="flex gap-3 rounded-lg border border-gray-100 bg-gray-50/80 p-4 shadow-sm"
              >
                <span
                  className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-white text-sm font-semibold text-gray-600 ring-1 ring-gray-200"
                  aria-hidden
                >
                  {index + 1}
                </span>
                <div className="min-w-0 flex-1">
                  <div className="flex flex-wrap items-center gap-2 gap-y-1">
                    <span className="font-medium text-gray-900">
                      {r.document_name}
                    </span>
                    <span
                      className={
                        r.is_mandatory
                          ? "rounded-full bg-rose-100 px-2 py-0.5 text-xs font-medium text-rose-800"
                          : "rounded-full bg-slate-100 px-2 py-0.5 text-xs font-medium text-slate-700"
                      }
                    >
                      {r.is_mandatory ? "Required" : "Optional"}
                    </span>
                  </div>
                  {r.description ? (
                    <p className="mt-2 text-sm leading-relaxed text-gray-600">
                      {r.description}
                    </p>
                  ) : null}
                </div>
              </li>
            ))}
          </ol>
        </section>
      ) : null}
    </div>
  );
}

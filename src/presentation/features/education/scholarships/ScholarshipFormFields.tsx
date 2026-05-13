import { useMemo } from "react";
import type { CourseRow, UniversityRow } from "@/domain/education";
import type { ScholarshipFormState } from "./types";

type Props = {
  form: ScholarshipFormState;
  onChange: (next: ScholarshipFormState) => void;
  universities: UniversityRow[];
  courses: CourseRow[];
  pending: boolean;
};

export function ScholarshipFormFields({
  form,
  onChange,
  universities,
  courses,
  pending,
}: Props) {
  const hasUniversities = universities.length > 0;
  const courseOptions = useMemo(
    () => courses.filter((c) => c.university_id === form.university_id),
    [courses, form.university_id]
  );

  return (
    <div className="grid gap-3 sm:grid-cols-2">
      <label className="sm:col-span-2 text-sm text-gray-700">
        <span className="mb-1 block font-medium">University</span>
        <select
          className="w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm"
          value={form.university_id}
          disabled={pending || !hasUniversities}
          onChange={(e) =>
            onChange({
              ...form,
              university_id: e.target.value,
              course_id: "",
            })
          }
        >
          {universities.map((u) => (
            <option key={u.id} value={u.id}>
              {u.name}
            </option>
          ))}
        </select>
      </label>
      <label className="sm:col-span-2 text-sm text-gray-700">
        <span className="mb-1 block">Course (optional)</span>
        <select
          className="w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm"
          value={form.course_id}
          disabled={pending || !form.university_id}
          onChange={(e) => onChange({ ...form, course_id: e.target.value })}
        >
          <option value="">— None —</option>
          {courseOptions.map((c) => (
            <option key={c.id} value={c.id}>
              {c.name}
            </option>
          ))}
        </select>
      </label>
      <label className="sm:col-span-2 text-sm text-gray-700">
        <span className="mb-1 block font-medium">Scholarship name</span>
        <input
          required
          className="w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm"
          value={form.name}
          disabled={pending}
          onChange={(e) => onChange({ ...form, name: e.target.value })}
        />
      </label>
      <label className="text-sm text-gray-700">
        <span className="mb-1 block">Amount</span>
        <input
          type="text"
          inputMode="decimal"
          className="w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm"
          value={form.amount}
          disabled={pending}
          onChange={(e) => onChange({ ...form, amount: e.target.value })}
        />
      </label>
      <label className="text-sm text-gray-700">
        <span className="mb-1 block">Deadline</span>
        <input
          type="date"
          className="w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm"
          value={form.deadline}
          disabled={pending}
          onChange={(e) => onChange({ ...form, deadline: e.target.value })}
        />
      </label>
      <label className="sm:col-span-2 text-sm text-gray-700">
        <span className="mb-1 block">Eligibility notes</span>
        <textarea
          rows={3}
          className="w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm"
          value={form.eligibility}
          disabled={pending}
          onChange={(e) => onChange({ ...form, eligibility: e.target.value })}
        />
      </label>
      {!hasUniversities ? (
        <p className="sm:col-span-2 text-sm text-amber-700">
          Add universities (and optionally courses) in the catalog first.
        </p>
      ) : null}
    </div>
  );
}

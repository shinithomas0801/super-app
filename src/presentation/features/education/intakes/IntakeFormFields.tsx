import type { CourseRow } from "@/domain/education";
import type { IntakeFormState } from "./types";

type Props = {
  form: IntakeFormState;
  onChange: (next: IntakeFormState) => void;
  courses: CourseRow[];
  pending: boolean;
};

export function IntakeFormFields({ form, onChange, courses, pending }: Props) {
  const hasCourses = courses.length > 0;

  return (
    <div className="grid gap-3 sm:grid-cols-2">
      <label className="sm:col-span-2 text-sm text-gray-700">
        <span className="mb-1 block font-medium">Course</span>
        <select
          className="w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm"
          value={form.course_id}
          disabled={pending || !hasCourses}
          onChange={(e) => onChange({ ...form, course_id: e.target.value })}
        >
          {!hasCourses ? (
            <option value="">— No courses —</option>
          ) : (
            courses.map((c) => (
              <option key={c.id} value={c.id}>
                {c.university_name
                  ? `${c.name} · ${c.university_name}`
                  : c.name}
              </option>
            ))
          )}
        </select>
      </label>
      <label className="sm:col-span-2 text-sm text-gray-700">
        <span className="mb-1 block font-medium">Intake name</span>
        <input
          required
          className="w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm"
          value={form.name}
          disabled={pending}
          onChange={(e) => onChange({ ...form, name: e.target.value })}
        />
      </label>
      <label className="text-sm text-gray-700">
        <span className="mb-1 block">Start date</span>
        <input
          type="date"
          className="w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm"
          value={form.start_date}
          disabled={pending}
          onChange={(e) => onChange({ ...form, start_date: e.target.value })}
        />
      </label>
      <label className="text-sm text-gray-700">
        <span className="mb-1 block">Application deadline</span>
        <input
          type="date"
          className="w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm"
          value={form.application_deadline}
          disabled={pending}
          onChange={(e) =>
            onChange({ ...form, application_deadline: e.target.value })
          }
        />
      </label>
      <label className="sm:col-span-2 text-sm text-gray-700">
        <span className="mb-1 block">Seats available</span>
        <input
          type="number"
          min={0}
          step={1}
          className="w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm"
          value={form.seats_available}
          disabled={pending}
          placeholder="Optional"
          onChange={(e) =>
            onChange({ ...form, seats_available: e.target.value })
          }
        />
      </label>
      {!hasCourses ? (
        <p className="sm:col-span-2 text-sm text-amber-700">
          Add courses in the catalog before creating intakes.
        </p>
      ) : null}
    </div>
  );
}

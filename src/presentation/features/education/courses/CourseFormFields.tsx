import type { UniversityRow } from "@/domain/education";
import type { CourseCreateFormState } from "./types";

type Props = {
  form: CourseCreateFormState;
  onChange: (next: CourseCreateFormState) => void;
  universities: UniversityRow[];
  pending: boolean;
};

export function CourseFormFields({
  form,
  onChange,
  universities,
  pending,
}: Props) {
  const hasUniversities = universities.length > 0;

  return (
    <>
      <div className="grid gap-3 sm:grid-cols-2">
        <label className="sm:col-span-2 text-sm text-gray-700">
          <span className="mb-1 block font-medium">University</span>
          <select
            className="w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm"
            value={form.university_id}
            disabled={pending || !hasUniversities}
            onChange={(e) =>
              onChange({ ...form, university_id: e.target.value })
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
          <span className="mb-1 block font-medium">Name</span>
          <input
            required
            className="w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm"
            value={form.name}
            disabled={pending}
            onChange={(e) => onChange({ ...form, name: e.target.value })}
          />
        </label>
        <label className="text-sm text-gray-700">
          <span className="mb-1 block">Degree</span>
          <input
            className="w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm"
            value={form.degree}
            disabled={pending}
            onChange={(e) => onChange({ ...form, degree: e.target.value })}
          />
        </label>
        <label className="text-sm text-gray-700">
          <span className="mb-1 block">Field of study</span>
          <input
            className="w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm"
            value={form.field_of_study}
            disabled={pending}
            onChange={(e) =>
              onChange({ ...form, field_of_study: e.target.value })
            }
          />
        </label>
        <label className="text-sm text-gray-700">
          <span className="mb-1 block">Duration (months)</span>
          <input
            type="number"
            min={1}
            className="w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm"
            value={form.duration_months}
            disabled={pending}
            onChange={(e) =>
              onChange({ ...form, duration_months: e.target.value })
            }
          />
        </label>
        <label className="text-sm text-gray-700">
          <span className="mb-1 block">Tuition fee</span>
          <input
            type="text"
            inputMode="decimal"
            className="w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm"
            value={form.tuition_fee}
            disabled={pending}
            onChange={(e) => onChange({ ...form, tuition_fee: e.target.value })}
          />
        </label>
        <label className="text-sm text-gray-700">
          <span className="mb-1 block">Currency</span>
          <input
            className="w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm"
            placeholder="USD"
            value={form.currency}
            disabled={pending}
            onChange={(e) => onChange({ ...form, currency: e.target.value })}
          />
        </label>
        <label className="sm:col-span-2 text-sm text-gray-700">
          <span className="mb-1 block">Min. qualification</span>
          <input
            className="w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm"
            value={form.min_qualification}
            disabled={pending}
            onChange={(e) =>
              onChange({ ...form, min_qualification: e.target.value })
            }
          />
        </label>
      </div>

      {!hasUniversities ? (
        <p className="mt-3 text-sm text-amber-700">
          Create a university first before adding courses.
        </p>
      ) : null}
    </>
  );
}

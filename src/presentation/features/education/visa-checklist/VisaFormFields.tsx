import type { CountryRow } from "@/domain/education";
import type { VisaChecklistFormState } from "./types";

type Props = {
  form: VisaChecklistFormState;
  onChange: (next: VisaChecklistFormState) => void;
  countries: CountryRow[];
  pending: boolean;
};

export function VisaFormFields({ form, onChange, countries, pending }: Props) {
  const hasCountries = countries.length > 0;

  return (
    <div className="grid gap-3 sm:grid-cols-2">
      <label className="sm:col-span-2 text-sm text-gray-700">
        <span className="mb-1 block font-medium">Country</span>
        <select
          className="w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm"
          value={form.country_id}
          disabled={pending || !hasCountries}
          onChange={(e) => onChange({ ...form, country_id: e.target.value })}
        >
          {countries.map((c) => (
            <option key={c.id} value={c.id}>
              {c.name}
            </option>
          ))}
        </select>
      </label>
      <label className="sm:col-span-2 text-sm text-gray-700">
        <span className="mb-1 block font-medium">Document name</span>
        <input
          required
          className="w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm"
          value={form.document_name}
          disabled={pending}
          onChange={(e) => onChange({ ...form, document_name: e.target.value })}
        />
      </label>
      <label className="sm:col-span-2 text-sm text-gray-700">
        <span className="mb-1 block">Description</span>
        <textarea
          rows={3}
          className="w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm"
          value={form.description}
          disabled={pending}
          onChange={(e) => onChange({ ...form, description: e.target.value })}
        />
      </label>
      <label className="sm:col-span-2 flex items-center gap-2 text-sm text-gray-700">
        <input
          type="checkbox"
          className="rounded border-gray-300"
          checked={form.is_mandatory}
          disabled={pending}
          onChange={(e) =>
            onChange({ ...form, is_mandatory: e.target.checked })
          }
        />
        Required for visa application
      </label>
      {!hasCountries ? (
        <p className="sm:col-span-2 text-sm text-amber-700">
          No countries in catalog. Add countries under Filters & countries
          first.
        </p>
      ) : null}
    </div>
  );
}

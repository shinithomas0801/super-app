import type { CountryRow } from "@/domain/education";
import type { UniversityFormState } from "./types";

type Props = {
  form: UniversityFormState;
  countries: CountryRow[];
  onChange: (next: UniversityFormState) => void;
};

function countryOptionLabel(country: CountryRow): string {
  const code = country.iso_code?.trim();
  return code ? `${country.name} (${code})` : country.name;
}

export function UniversityFormFields({ form, countries, onChange }: Props) {
  const hasCountries = countries.length > 0;

  return (
    <div className="grid gap-3 md:grid-cols-2">
      <label className="text-sm text-gray-700">
        <span className="mb-1 block">Country</span>
        <select
          className="w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm disabled:bg-gray-100"
          value={form.country_id}
          onChange={(event) =>
            onChange({ ...form, country_id: event.target.value })
          }
          disabled={!hasCountries}
          required
        >
          {hasCountries ? (
            countries.map((country) => (
              <option key={country.id} value={country.id}>
                {countryOptionLabel(country)}
              </option>
            ))
          ) : (
            <option value="">No countries configured</option>
          )}
        </select>
      </label>
      <label className="text-sm text-gray-700">
        <span className="mb-1 block">University name</span>
        <input
          className="w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm"
          placeholder="University name"
          value={form.name}
          onChange={(event) => onChange({ ...form, name: event.target.value })}
          required
        />
      </label>
      <label className="text-sm text-gray-700">
        <span className="mb-1 block">City</span>
        <input
          className="w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm"
          placeholder="City"
          value={form.city}
          onChange={(event) => onChange({ ...form, city: event.target.value })}
        />
      </label>
      <label className="text-sm text-gray-700">
        <span className="mb-1 block">Website</span>
        <input
          className="w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm"
          placeholder="https://website"
          value={form.website_url}
          onChange={(event) =>
            onChange({ ...form, website_url: event.target.value })
          }
        />
      </label>
      <label className="text-sm text-gray-700">
        <span className="mb-1 block">Ranking</span>
        <input
          className="w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm"
          placeholder="e.g. 150"
          inputMode="numeric"
          value={form.ranking}
          onChange={(event) =>
            onChange({ ...form, ranking: event.target.value })
          }
        />
      </label>
    </div>
  );
}

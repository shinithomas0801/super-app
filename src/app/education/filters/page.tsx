import {
  listEducationCatalogUseCase,
  listEducationCountriesUseCase,
} from "@/application/education";
import { CountryManagementPresenter } from "@/presentation/features/education/filters/presenters";
import { EducationSafePage } from "@/presentation/features/education/shared/components";
import { DataTablePresenter } from "@/presentation/features/education/shared/presenters";

export default function EducationFiltersPage() {
  return (
    <EducationSafePage
      loader={async () => {
        const [catalog, countries] = await Promise.all([
          listEducationCatalogUseCase(),
          listEducationCountriesUseCase(),
        ]);
        return { ...catalog, countries };
      }}
      render={({ countries, universities, courses }) => (
        <div className="space-y-10">
          <div>
            <h1 className="text-xl font-bold text-gray-900">
              Filters & country selection
            </h1>
            <p className="mt-2 max-w-3xl text-sm text-gray-600">
              Countries drive visa content, benchmarks, and catalog filtering.
              Saved admin filters live in{" "}
              <code className="rounded bg-gray-100 px-1 text-xs">
                education_saved_filters
              </code>{" "}
              (per-user scope hooks for UI state—populate via SQL or upcoming
              CRUD).
            </p>
          </div>
          <CountryManagementPresenter countries={countries} />
          <DataTablePresenter
            title="Universities (preview)"
            rows={universities.slice(0, 25)}
            columns={[
              { header: "#", accessor: (_r, rowIndex) => rowIndex + 1 },
              { header: "Name", accessor: (r) => r.name },
              { header: "City", accessor: (r) => r.city },
              { header: "Country id", accessor: (r) => r.country_id },
              {
                header: "Ranking",
                accessor: (r) => (r.ranking != null ? String(r.ranking) : ""),
              },
            ]}
          />
          <DataTablePresenter
            title="Courses (preview)"
            rows={courses.slice(0, 25)}
            columns={[
              { header: "#", accessor: (_r, rowIndex) => rowIndex + 1 },
              { header: "Name", accessor: (r) => r.name },
              { header: "Degree", accessor: (r) => r.degree ?? "—" },
              { header: "University id", accessor: (r) => r.university_id },
            ]}
          />
        </div>
      )}
    />
  );
}

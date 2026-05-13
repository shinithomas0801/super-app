import {
  listEducationCatalogUseCase,
  listEducationUniversitiesUseCase,
} from "@/application/education";
import { EducationSafePage } from "@/presentation/features/education/shared/components";
import { UniversityManagementPresenter } from "@/presentation/features/education/universities/presenters";

export default function EducationUniversitiesPage() {
  return (
    <EducationSafePage
      loader={async () => {
        const [universities, catalog] = await Promise.all([
          listEducationUniversitiesUseCase(),
          listEducationCatalogUseCase(),
        ]);
        return { universities, countries: catalog.countries };
      }}
      render={({ universities, countries }) => (
        <UniversityManagementPresenter
          universities={universities}
          countries={countries}
        />
      )}
    />
  );
}

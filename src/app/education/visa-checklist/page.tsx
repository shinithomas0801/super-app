import {
  listEducationCountriesUseCase,
  listEducationVisaChecklistUseCase,
} from "@/application/education";
import { EducationSafePage } from "@/presentation/features/education/shared/components";
import { VisaChecklistManagementPresenter } from "@/presentation/features/education/visa-checklist/presenters/VisaChecklistManagement.presenter";

export default function EducationVisaChecklistPage() {
  return (
    <EducationSafePage
      loader={async () => {
        const [items, countries] = await Promise.all([
          listEducationVisaChecklistUseCase(),
          listEducationCountriesUseCase(),
        ]);
        return { items, countries };
      }}
      render={({ items, countries }) => (
        <VisaChecklistManagementPresenter items={items} countries={countries} />
      )}
    />
  );
}

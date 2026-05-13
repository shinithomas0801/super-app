import {
  listEducationCostBenchmarksUseCase,
  listEducationCatalogUseCase,
} from "@/application/education";
import { EducationSafePage } from "@/presentation/features/education/shared/components";
import { CostCalculatorPresenter } from "@/presentation/features/education/shared/presenters";

export default function EducationCostCalculatorPage() {
  return (
    <EducationSafePage
      loader={async () => {
        const [catalog, benchmarks] = await Promise.all([
          listEducationCatalogUseCase(),
          listEducationCostBenchmarksUseCase(),
        ]);
        return { countries: catalog.countries, benchmarks };
      }}
      render={({ countries, benchmarks }) => (
        <CostCalculatorPresenter countries={countries} benchmarks={benchmarks} />
      )}
    />
  );
}

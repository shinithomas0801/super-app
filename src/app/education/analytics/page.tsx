import { getEducationAnalyticsUseCase } from "@/application/education";
import { EducationSafePage } from "@/presentation/features/education/shared/components";
import { EducationAnalyticsPresenter } from "@/presentation/features/education/shared/presenters";

export default function EducationAnalyticsPage() {
  return (
    <EducationSafePage
      loader={getEducationAnalyticsUseCase}
      render={(analytics) => (
        <EducationAnalyticsPresenter analytics={analytics} />
      )}
    />
  );
}

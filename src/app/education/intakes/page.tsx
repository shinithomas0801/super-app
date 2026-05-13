import {
  listEducationCoursesUseCase,
  listEducationIntakesUseCase,
} from "@/application/education";
import { EducationSafePage } from "@/presentation/features/education/shared/components";
import { IntakeManagementPresenter } from "@/presentation/features/education/intakes/presenters/IntakeManagement.presenter";

export default function EducationIntakesPage() {
  return (
    <EducationSafePage
      loader={async () => {
        const [intakes, courses] = await Promise.all([
          listEducationIntakesUseCase(),
          listEducationCoursesUseCase(),
        ]);
        return { intakes, courses };
      }}
      render={({ intakes, courses }) => (
        <IntakeManagementPresenter intakes={intakes} courses={courses} />
      )}
    />
  );
}

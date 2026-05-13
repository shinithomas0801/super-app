import {
  listEducationCoursesUseCase,
  listEducationScholarshipsUseCase,
  listEducationUniversitiesUseCase,
} from "@/application/education";
import { EducationSafePage } from "@/presentation/features/education/shared/components";
import { ScholarshipManagementPresenter } from "@/presentation/features/education/scholarships/presenters/ScholarshipManagement.presenter";

export default function EducationScholarshipsPage() {
  return (
    <EducationSafePage
      loader={async () => {
        const [scholarships, universities, courses] = await Promise.all([
          listEducationScholarshipsUseCase(),
          listEducationUniversitiesUseCase(),
          listEducationCoursesUseCase(),
        ]);
        return { scholarships, universities, courses };
      }}
      render={({ scholarships, universities, courses }) => (
        <ScholarshipManagementPresenter
          scholarships={scholarships}
          universities={universities}
          courses={courses}
        />
      )}
    />
  );
}

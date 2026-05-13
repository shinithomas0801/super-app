import {
  listEducationCoursesUseCase,
  listEducationUniversitiesUseCase,
} from "@/application/education";
import { EducationSafePage } from "@/presentation/features/education/shared/components";
import { CourseManagementPresenter } from "@/presentation/features/education/courses/presenters/CourseManagement.presenter";

export default function EducationCoursesPage() {
  return (
    <EducationSafePage
      loader={async () => {
        const [courses, universities] = await Promise.all([
          listEducationCoursesUseCase(),
          listEducationUniversitiesUseCase(),
        ]);
        return { courses, universities };
      }}
      render={({ courses, universities }) => (
        <CourseManagementPresenter
          courses={courses}
          universities={universities}
        />
      )}
    />
  );
}

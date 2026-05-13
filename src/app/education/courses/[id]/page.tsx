import { getEducationCourseDetailUseCase } from "@/application/education";
import { EducationSafePage } from "@/presentation/features/education/shared/components";
import { CourseDetailPresenter } from "@/presentation/features/education/courses/presenters/CourseDetail.presenter";

type PageProps = {
  params: Promise<{ id: string }>;
};

export default function EducationCourseDetailPage({ params }: PageProps) {
  return (
    <EducationSafePage
      loader={async () => {
        const { id } = await params;
        return getEducationCourseDetailUseCase(id);
      }}
      render={(result) =>
        result.found ? (
          <CourseDetailPresenter detail={result.detail} />
        ) : (
          <div className="rounded-lg border border-amber-200 bg-amber-50 p-6 text-sm text-amber-900">
            Course not found.
          </div>
        )
      }
    />
  );
}

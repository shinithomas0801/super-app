import { getEducationUniversityDetailUseCase } from "@/application/education";
import { EducationSafePage } from "@/presentation/features/education/shared/components";
import { UniversityDetailPresenter } from "@/presentation/features/education/universities/presenters";

type PageProps = {
  params: Promise<{ id: string }>;
};

export default function EducationUniversityDetailPage({ params }: PageProps) {
  return (
    <EducationSafePage
      loader={async () => {
        const { id } = await params;
        return getEducationUniversityDetailUseCase(id);
      }}
      render={(result) =>
        result.found ? (
          <UniversityDetailPresenter detail={result.detail} />
        ) : (
          <div className="rounded-lg border border-amber-200 bg-amber-50 p-6 text-sm text-amber-900">
            University not found.
          </div>
        )
      }
    />
  );
}

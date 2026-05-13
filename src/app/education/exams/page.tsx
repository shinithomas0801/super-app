import { listEducationExamScoresUseCase } from "@/application/education";
import { EducationSafePage } from "@/presentation/features/education/shared/components";
import { DataTablePresenter } from "@/presentation/features/education/shared/presenters";

export default function EducationExamsPage() {
  return (
    <EducationSafePage
      loader={listEducationExamScoresUseCase}
      render={(rows) => (
        <DataTablePresenter
          title="Exam score management"
          description="Normalized scores for standardized tests; section breakdowns live in JSON."
          rows={rows}
          columns={[
            { header: "Exam", accessor: (r) => r.exam_code },
            { header: "Student id", accessor: (r) => r.student_id },
            { header: "Overall", accessor: (r) => r.overall_score },
            { header: "Test date", accessor: (r) => r.tested_on },
            {
              header: "Verified",
              accessor: (r) => (r.verified ? "Yes" : "No"),
            },
          ]}
        />
      )}
    />
  );
}

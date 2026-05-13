import { listEducationStudentsUseCase } from "@/application/education";
import { EducationSafePage } from "@/presentation/features/education/shared/components";
import { DataTablePresenter } from "@/presentation/features/education/shared/presenters";

export default function EducationStudentsPage() {
  return (
    <EducationSafePage
      loader={listEducationStudentsUseCase}
      render={(rows) => (
        <DataTablePresenter
          title="Student profiles"
          description="Core profile rows for counseling; extend academics via related tables."
          rows={rows}
          columns={[
            { header: "Name", accessor: (r) => r.full_name },
            { header: "Email", accessor: (r) => r.email },
            {
              header: "Nationality (country id)",
              accessor: (r) => r.nationality_country_id,
            },
            {
              header: "External ref",
              accessor: (r) => r.external_student_ref,
            },
          ]}
        />
      )}
    />
  );
}

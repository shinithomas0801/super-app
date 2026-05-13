import {
  listEducationMarkUploadsUseCase,
  listEducationStudentsUseCase,
} from "@/application/education";
import { EducationSafePage } from "@/presentation/features/education/shared/components";
import {
  DataTablePresenter,
  MarkListUploadFormPresenter,
} from "@/presentation/features/education/shared/presenters";

export default function EducationMarkListsPage() {
  return (
    <EducationSafePage
      loader={async () => {
        const [uploads, students] = await Promise.all([
          listEducationMarkUploadsUseCase(),
          listEducationStudentsUseCase(),
        ]);
        return { uploads, students };
      }}
      render={({ uploads, students }) => (
        <>
          <MarkListUploadFormPresenter students={students} />
          <DataTablePresenter
            title="Mark list uploads"
            description="Tracks Storage objects and parsing lifecycle."
            rows={uploads}
            columns={[
              { header: "Filename", accessor: (r) => r.original_filename },
              { header: "Student id", accessor: (r) => r.student_id },
              { header: "Status", accessor: (r) => r.status },
              { header: "Uploaded", accessor: (r) => r.created_at },
            ]}
          />
        </>
      )}
    />
  );
}

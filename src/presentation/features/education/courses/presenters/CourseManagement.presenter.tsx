"use client";

import { ConfirmationDialog, Table } from "@/components";
import type { TableColumn } from "@/components";
import type { CourseRow } from "@/domain/education";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { CourseCreateDialog } from "../CourseCreateDialog";
import { CourseEditDialog } from "../CourseEditDialog";
import { useCourseCrud } from "../useCourseCrud";
import type { CourseManagementProps } from "../types";

export function CourseManagementPresenter(props: CourseManagementProps) {
  const router = useRouter();
  const courseCrud = useCourseCrud(props);
  const [courseToDelete, setCourseToDelete] = useState<string | null>(null);

  const columns: TableColumn<CourseRow>[] = [
    {
      id: "row",
      header: "#",
      accessor: (_r, rowIndex) => rowIndex + 1,
    },
    {
      id: "name",
      header: "Name",
      accessor: (r) => r.name,
    },
    {
      id: "university",
      header: "University",
      accessor: (r) =>
        r.university_name ??
        courseCrud.universityMap.get(r.university_id)?.name ??
        r.university_id,
    },
    {
      id: "degree",
      header: "Degree",
      accessor: (r) => r.degree ?? "—",
    },
    {
      id: "field",
      header: "Field",
      accessor: (r) => r.field_of_study ?? "—",
    },
    {
      id: "duration",
      header: "Months",
      accessor: (r) =>
        r.duration_months != null ? String(r.duration_months) : "—",
    },
    {
      id: "tuition",
      header: "Tuition",
      accessor: (r) =>
        r.tuition_fee != null
          ? `${r.tuition_fee}${r.currency ? ` ${r.currency}` : ""}`
          : "—",
    },
    {
      id: "actions",
      header: "Actions",
      cellClassName: "max-w-none",
      accessor: (r) => (
        <div
          className="flex gap-2"
          onClick={(event) => event.stopPropagation()}
        >
          <button
            type="button"
            className="rounded border border-gray-300 px-2 py-1 text-xs"
            onClick={() => {
              courseCrud.setError(null);
              courseCrud.startEditing(r);
            }}
          >
            Edit
          </button>
          <button
            type="button"
            className="rounded border border-red-300 px-2 py-1 text-xs text-red-700"
            onClick={() => setCourseToDelete(r.id)}
            disabled={courseCrud.pending}
          >
            Delete
          </button>
        </div>
      ),
    },
  ];

  return (
    <div>
      <div className="mb-6">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div>
            <h1 className="text-xl font-bold text-gray-900">
              Course management
            </h1>
            <p className="mt-1 text-sm text-gray-600">
              Catalog programs per university; open a row for details and
              images.
            </p>
          </div>
          <button
            type="button"
            className="rounded-md bg-gray-900 px-4 py-2 text-sm font-medium text-white"
            onClick={() => {
              courseCrud.setError(null);
              const firstId = props.universities[0]?.id ?? "";
              courseCrud.setCreateForm((prev) => ({
                ...prev,
                university_id: prev.university_id || firstId,
              }));
              courseCrud.setCreateOpen(true);
            }}
          >
            Create course
          </button>
        </div>
      </div>

      {courseCrud.error ? (
        <p className="mb-4 text-sm text-red-600">{courseCrud.error}</p>
      ) : null}

      <Table
        columns={columns}
        rows={props.courses}
        getRowKey={(r) => r.id}
        bodyRowClassName="align-top"
        getRowProps={(row) => ({
          className: "cursor-pointer",
          onClick: () => router.push(`/education/courses/${row.id}`),
        })}
      />

      <CourseCreateDialog
        open={courseCrud.createOpen}
        pending={courseCrud.pending}
        universities={props.universities}
        form={courseCrud.createForm}
        onChange={courseCrud.setCreateForm}
        onClose={() => courseCrud.setCreateOpen(false)}
        onSubmit={(e) => void courseCrud.createCourse(e)}
      />

      <CourseEditDialog
        open={Boolean(courseCrud.editingId && courseCrud.editingForm)}
        pending={courseCrud.pending}
        universities={props.universities}
        form={courseCrud.editingForm}
        onChange={(next) => courseCrud.setEditingForm(next)}
        onClose={() => {
          courseCrud.setEditingId(null);
          courseCrud.setEditingForm(null);
        }}
        onSubmit={() => {
          if (courseCrud.editingId) {
            void courseCrud.saveEdit(courseCrud.editingId);
          }
        }}
      />

      <ConfirmationDialog
        open={Boolean(courseToDelete)}
        title="Delete course?"
        description="This cannot be undone. Related intakes, images, and other rows that reference this course may be removed or blocked by the database."
        confirmLabel="Delete"
        pending={courseCrud.pending}
        onCancel={() => setCourseToDelete(null)}
        onConfirm={() => {
          if (!courseToDelete) return;
          void courseCrud.removeCourse(courseToDelete).finally(() => {
            setCourseToDelete(null);
          });
        }}
      />
    </div>
  );
}

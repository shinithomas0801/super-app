"use client";

import { ConfirmationDialog, Table } from "@/components";
import type { TableColumn } from "@/components";
import type { ScholarshipRow } from "@/domain/education";
import { useState } from "react";
import { ScholarshipCreateDialog } from "../ScholarshipCreateDialog";
import { ScholarshipEditDialog } from "../ScholarshipEditDialog";
import { useScholarshipCrud } from "../useScholarshipCrud";
import type { ScholarshipManagementProps } from "../types";

function truncate(s: string | null, max: number) {
  if (!s) return "—";
  return s.length <= max ? s : `${s.slice(0, max)}…`;
}

export function ScholarshipManagementPresenter(
  props: ScholarshipManagementProps
) {
  const crud = useScholarshipCrud(props);
  const [toDelete, setToDelete] = useState<string | null>(null);

  const columns: TableColumn<ScholarshipRow>[] = [
    {
      id: "row",
      header: "#",
      accessor: (_r, rowIndex) => rowIndex + 1,
    },
    { id: "name", header: "Name", accessor: (r) => r.name },
    {
      id: "university",
      header: "University",
      accessor: (r) =>
        r.university_name ??
        crud.universityMap.get(r.university_id)?.name ??
        r.university_id,
    },
    {
      id: "course",
      header: "Course",
      accessor: (r) => r.course_name ?? (r.course_id ? r.course_id : "—"),
    },
    {
      id: "amount",
      header: "Amount",
      accessor: (r) => r.amount ?? "—",
    },
    {
      id: "deadline",
      header: "Deadline",
      accessor: (r) => r.deadline ?? "—",
    },
    {
      id: "eligibility",
      header: "Eligibility",
      accessor: (r) => truncate(r.eligibility, 48),
    },
    {
      id: "actions",
      header: "Actions",
      cellClassName: "max-w-none",
      accessor: (r) => (
        <div className="flex gap-2" onClick={(e) => e.stopPropagation()}>
          <button
            type="button"
            className="rounded border border-gray-300 px-2 py-1 text-xs"
            onClick={() => {
              crud.setError(null);
              crud.startEditing(r);
            }}
          >
            Edit
          </button>
          <button
            type="button"
            className="rounded border border-red-300 px-2 py-1 text-xs text-red-700"
            onClick={() => setToDelete(r.id)}
            disabled={crud.pending}
          >
            Delete
          </button>
        </div>
      ),
    },
  ];

  return (
    <div>
      <div className="mb-6 flex flex-wrap items-start justify-between gap-3">
        <div>
          <h1 className="text-xl font-bold text-gray-900">
            Scholarship listings
          </h1>
          <p className="mt-1 text-sm text-gray-600">
            Manage scholarships tied to universities and optional courses.
          </p>
        </div>
        <button
          type="button"
          className="rounded-md bg-gray-900 px-4 py-2 text-sm font-medium text-white"
          onClick={() => {
            crud.setError(null);
            const first = crud.initialUniversity;
            crud.setCreateForm((prev) => ({
              ...emptyFormForOpen(first),
              university_id: prev.university_id || first,
            }));
            crud.setCreateOpen(true);
          }}
        >
          Create scholarship
        </button>
      </div>

      {crud.error ? (
        <p className="mb-4 text-sm text-red-600">{crud.error}</p>
      ) : null}

      <Table
        columns={columns}
        rows={props.scholarships}
        getRowKey={(r) => r.id}
        bodyRowClassName="align-top"
      />

      <ScholarshipCreateDialog
        open={crud.createOpen}
        pending={crud.pending}
        universities={props.universities}
        courses={props.courses}
        form={crud.createForm}
        onChange={crud.setCreateForm}
        onClose={() => crud.setCreateOpen(false)}
        onSubmit={(e) => void crud.createScholarship(e)}
      />

      <ScholarshipEditDialog
        open={Boolean(crud.editingId && crud.editingForm)}
        pending={crud.pending}
        universities={props.universities}
        courses={props.courses}
        form={crud.editingForm}
        onChange={(next) => crud.setEditingForm(next)}
        onClose={() => {
          crud.setEditingId(null);
          crud.setEditingForm(null);
        }}
        onSubmit={() => {
          if (crud.editingId) void crud.saveEdit(crud.editingId);
        }}
      />

      <ConfirmationDialog
        open={Boolean(toDelete)}
        title="Delete scholarship?"
        description="This cannot be undone."
        confirmLabel="Delete"
        pending={crud.pending}
        onCancel={() => setToDelete(null)}
        onConfirm={() => {
          if (!toDelete) return;
          void crud
            .removeScholarship(toDelete)
            .finally(() => setToDelete(null));
        }}
      />
    </div>
  );
}

function emptyFormForOpen(initialUniversity: string) {
  return {
    university_id: initialUniversity,
    course_id: "",
    name: "",
    amount: "",
    eligibility: "",
    deadline: "",
  };
}

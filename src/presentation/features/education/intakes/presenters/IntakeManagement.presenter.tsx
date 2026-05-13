"use client";

import { ConfirmationDialog, Table } from "@/components";
import type { TableColumn } from "@/components";
import type { IntakeRow } from "@/domain/education";
import { useState } from "react";
import { IntakeCreateDialog } from "../IntakeCreateDialog";
import { IntakeEditDialog } from "../IntakeEditDialog";
import { useIntakeCrud } from "../useIntakeCrud";
import type { IntakeManagementProps } from "../types";

function fmtDate(s: string | null) {
  if (!s) return "—";
  return s.length >= 10 ? s.slice(0, 10) : s;
}

export function IntakeManagementPresenter(props: IntakeManagementProps) {
  const crud = useIntakeCrud(props);
  const [toDelete, setToDelete] = useState<string | null>(null);

  const columns: TableColumn<IntakeRow>[] = [
    {
      id: "row",
      header: "#",
      accessor: (_r, rowIndex) => rowIndex + 1,
    },
    { id: "name", header: "Name", accessor: (r) => r.name },
    {
      id: "course",
      header: "Course",
      accessor: (r) =>
        r.course_name ?? crud.courseMap.get(r.course_id)?.name ?? r.course_id,
    },
    {
      id: "start",
      header: "Start",
      accessor: (r) => fmtDate(r.start_date),
    },
    {
      id: "deadline",
      header: "Application deadline",
      accessor: (r) => fmtDate(r.application_deadline),
    },
    {
      id: "seats",
      header: "Seats",
      accessor: (r) =>
        r.seats_available != null ? String(r.seats_available) : "—",
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
          <h1 className="text-xl font-bold text-gray-900">Intake timelines</h1>
          <p className="mt-1 text-sm text-gray-600">
            Per-course intake seasons with start dates, deadlines, and seat
            counts.
          </p>
        </div>
        <button
          type="button"
          className="rounded-md bg-gray-900 px-4 py-2 text-sm font-medium text-white"
          onClick={() => {
            crud.setError(null);
            const first = crud.initialCourseId;
            crud.setCreateForm((prev) => ({
              ...emptyFormForOpen(first),
              course_id: prev.course_id || first,
            }));
            crud.setCreateOpen(true);
          }}
        >
          Create intake
        </button>
      </div>

      {crud.error ? (
        <p className="mb-4 text-sm text-red-600">{crud.error}</p>
      ) : null}

      <Table
        columns={columns}
        rows={props.intakes}
        getRowKey={(r) => r.id}
        bodyRowClassName="align-top"
      />

      <IntakeCreateDialog
        open={crud.createOpen}
        pending={crud.pending}
        courses={props.courses}
        form={crud.createForm}
        onChange={crud.setCreateForm}
        onClose={() => crud.setCreateOpen(false)}
        onSubmit={(e) => void crud.createIntake(e)}
      />

      <IntakeEditDialog
        open={Boolean(crud.editingId && crud.editingForm)}
        pending={crud.pending}
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
        title="Delete intake?"
        description="This cannot be undone."
        confirmLabel="Delete"
        pending={crud.pending}
        onCancel={() => setToDelete(null)}
        onConfirm={() => {
          if (!toDelete) return;
          void crud.removeIntake(toDelete).finally(() => setToDelete(null));
        }}
      />
    </div>
  );
}

function emptyFormForOpen(initialCourseId: string) {
  return {
    course_id: initialCourseId,
    name: "",
    start_date: "",
    application_deadline: "",
    seats_available: "",
  };
}

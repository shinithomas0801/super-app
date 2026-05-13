"use client";

import { ConfirmationDialog, Table } from "@/components";
import type { TableColumn } from "@/components";
import type { UniversityRow } from "@/domain/education";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { UniversityCreateDialog } from "./universities/UniversityCreateDialog";
import { UniversityEditDialog } from "./universities/UniversityEditDialog";
import { useUniversityCrud } from "./universities/useUniversityCrud";
import type { UniversityManagementProps } from "./universities/types";

export function UniversityManagementPresenter(
  props: UniversityManagementProps
) {
  const router = useRouter();
  const universityCrud = useUniversityCrud(props);
  const [universityToDelete, setUniversityToDelete] = useState<string | null>(
    null
  );

  const columns: TableColumn<UniversityRow>[] = [
    {
      id: "row",
      header: "#",
      accessor: (_r, rowIndex) => rowIndex + 1,
    },
    { id: "name", header: "Name", accessor: (r) => r.name },
    {
      id: "country",
      header: "Country",
      accessor: (r) =>
        universityCrud.countryMap.get(r.country_id)?.name ?? r.country_id,
    },
    { id: "city", header: "City", accessor: (r) => r.city },
    { id: "website", header: "Website", accessor: (r) => r.website_url },
    {
      id: "ranking",
      header: "Ranking",
      accessor: (r) => (r.ranking != null ? String(r.ranking) : ""),
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
            onClick={() => universityCrud.startEditing(r)}
          >
            Edit
          </button>
          <button
            type="button"
            className="rounded border border-red-300 px-2 py-1 text-xs text-red-700"
            onClick={() => setUniversityToDelete(r.id)}
            disabled={universityCrud.pending}
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
              University management
            </h1>
            <p className="mt-1 text-sm text-gray-600">
              Create, edit, and remove universities used by courses and
              eligibility rules.
            </p>
          </div>
          <button
            type="button"
            className="rounded-md bg-gray-900 px-4 py-2 text-sm font-medium text-white"
            onClick={() => {
              universityCrud.setError(null);
              universityCrud.setCreateOpen(true);
            }}
          >
            Create university
          </button>
        </div>
      </div>

      {universityCrud.error ? (
        <p className="mb-4 text-sm text-red-600">{universityCrud.error}</p>
      ) : null}

      <Table
        columns={columns}
        rows={universityCrud.universities}
        getRowKey={(r) => r.id}
        bodyRowClassName="align-top"
        getRowProps={(row) => ({
          className: "cursor-pointer",
          onClick: () => router.push(`/education/universities/${row.id}`),
        })}
      />

      <UniversityCreateDialog
        open={universityCrud.createOpen}
        pending={universityCrud.pending}
        countries={universityCrud.countries}
        form={universityCrud.createForm}
        onChange={universityCrud.setCreateForm}
        onClose={() => universityCrud.setCreateOpen(false)}
        onSubmit={universityCrud.createUniversity}
      />

      <UniversityEditDialog
        open={Boolean(universityCrud.editingId && universityCrud.editingForm)}
        pending={universityCrud.pending}
        countries={universityCrud.countries}
        form={universityCrud.editingForm}
        onChange={(next) => universityCrud.setEditingForm(next)}
        onClose={() => {
          universityCrud.setEditingId(null);
          universityCrud.setEditingForm(null);
        }}
        onSubmit={() => {
          if (universityCrud.editingId) {
            void universityCrud.saveEdit(universityCrud.editingId);
          }
        }}
      />

      <ConfirmationDialog
        open={Boolean(universityToDelete)}
        title="Delete university?"
        description="This action cannot be undone and related courses may cascade."
        confirmLabel="Delete"
        pending={universityCrud.pending}
        onCancel={() => setUniversityToDelete(null)}
        onConfirm={() => {
          if (!universityToDelete) return;
          void universityCrud
            .removeUniversity(universityToDelete)
            .finally(() => {
              setUniversityToDelete(null);
            });
        }}
      />
    </div>
  );
}

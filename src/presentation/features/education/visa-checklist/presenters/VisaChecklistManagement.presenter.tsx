"use client";

import { ConfirmationDialog } from "@/components";
import type { VisaChecklistRow } from "@/domain/education";
import { useMemo, useState } from "react";
import { VisaCreateDialog } from "../VisaCreateDialog";
import { VisaEditDialog } from "../VisaEditDialog";
import { useVisaChecklistCrud } from "../useVisaChecklistCrud";
import type {
  VisaChecklistFormState,
  VisaChecklistManagementProps,
} from "../types";

export function VisaChecklistManagementPresenter(
  props: VisaChecklistManagementProps
) {
  const crud = useVisaChecklistCrud(props);
  const [toDelete, setToDelete] = useState<string | null>(null);

  const groupedByCountry = useMemo(() => {
    const map = new Map<string, VisaChecklistRow[]>();
    for (const item of props.items) {
      const list = map.get(item.country_id) ?? [];
      list.push(item);
      map.set(item.country_id, list);
    }
    for (const list of map.values()) {
      list.sort((a, b) =>
        a.document_name.localeCompare(b.document_name, undefined, {
          sensitivity: "base",
        })
      );
    }
    return Array.from(map.entries()).sort(([idA], [idB]) => {
      const nameA = crud.countryMap.get(idA)?.name ?? idA;
      const nameB = crud.countryMap.get(idB)?.name ?? idB;
      return nameA.localeCompare(nameB, undefined, { sensitivity: "base" });
    });
  }, [props.items, crud.countryMap]);

  return (
    <div>
      <div className="mb-6 flex flex-wrap items-start justify-between gap-3">
        <div>
          <h1 className="text-xl font-bold text-gray-900">Visa checklist</h1>
          <p className="mt-1 text-sm text-gray-600">
            Documents grouped by destination country. Add or edit items without
            scanning wide tables.
          </p>
        </div>
        <button
          type="button"
          className="rounded-md bg-gray-900 px-4 py-2 text-sm font-medium text-white"
          onClick={() => {
            crud.setError(null);
            const first = crud.initialCountry;
            crud.setCreateForm((prev) => ({
              ...emptyVisaForm(first),
              country_id: prev.country_id || first,
            }));
            crud.setCreateOpen(true);
          }}
        >
          Add item
        </button>
      </div>

      {crud.error ? (
        <p className="mb-4 text-sm text-red-600">{crud.error}</p>
      ) : null}

      {groupedByCountry.length === 0 ? (
        <p className="rounded-lg border border-dashed border-gray-300 bg-gray-50/80 p-8 text-center text-sm text-gray-600">
          No checklist items yet. Use &quot;Add item&quot; to create the first
          document requirement for a country.
        </p>
      ) : (
        <div className="space-y-10">
          {groupedByCountry.map(([countryId, rows]) => (
            <section key={countryId} className="scroll-mt-4">
              <h2 className="border-b border-gray-200 pb-2 text-base font-semibold text-gray-900">
                {crud.countryMap.get(countryId)?.name ?? countryId}
                <span className="ml-2 font-normal text-gray-500">
                  ({rows.length} item{rows.length === 1 ? "" : "s"})
                </span>
              </h2>
              <ul className="mt-4 list-none space-y-3 p-0">
                {rows.map((r) => (
                  <li
                    key={r.id}
                    className="flex flex-col gap-3 rounded-lg border border-gray-200 bg-white p-4 shadow-sm sm:flex-row sm:items-start sm:justify-between"
                  >
                    <div className="min-w-0 flex-1">
                      <div className="flex flex-wrap items-center gap-2">
                        <span className="font-medium text-gray-900">
                          {r.document_name}
                        </span>
                        <span
                          className={
                            r.is_mandatory
                              ? "rounded-full bg-rose-100 px-2 py-0.5 text-xs font-medium text-rose-800"
                              : "rounded-full bg-slate-100 px-2 py-0.5 text-xs font-medium text-slate-700"
                          }
                        >
                          {r.is_mandatory ? "Required" : "Optional"}
                        </span>
                      </div>
                      {r.description ? (
                        <p className="mt-2 text-sm leading-relaxed text-gray-600">
                          {r.description}
                        </p>
                      ) : (
                        <p className="mt-2 text-sm italic text-gray-400">
                          No description
                        </p>
                      )}
                    </div>
                    <div className="flex shrink-0 gap-2 sm:pt-0.5">
                      <button
                        type="button"
                        className="rounded-md border border-gray-300 bg-white px-3 py-1.5 text-xs font-medium text-gray-800 hover:bg-gray-50"
                        onClick={() => {
                          crud.setError(null);
                          crud.startEditing(r);
                        }}
                      >
                        Edit
                      </button>
                      <button
                        type="button"
                        className="rounded-md border border-red-200 bg-white px-3 py-1.5 text-xs font-medium text-red-700 hover:bg-red-50"
                        onClick={() => setToDelete(r.id)}
                        disabled={crud.pending}
                      >
                        Delete
                      </button>
                    </div>
                  </li>
                ))}
              </ul>
            </section>
          ))}
        </div>
      )}

      <VisaCreateDialog
        open={crud.createOpen}
        pending={crud.pending}
        countries={props.countries}
        form={crud.createForm}
        onChange={crud.setCreateForm}
        onClose={() => crud.setCreateOpen(false)}
        onSubmit={(e) => void crud.createItem(e)}
      />

      <VisaEditDialog
        open={Boolean(crud.editingId && crud.editingForm)}
        pending={crud.pending}
        countries={props.countries}
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
        title="Delete checklist item?"
        description="This cannot be undone."
        confirmLabel="Delete"
        pending={crud.pending}
        onCancel={() => setToDelete(null)}
        onConfirm={() => {
          if (!toDelete) return;
          void crud.removeItem(toDelete).finally(() => setToDelete(null));
        }}
      />
    </div>
  );
}

function emptyVisaForm(initialCountry: string): VisaChecklistFormState {
  return {
    country_id: initialCountry,
    document_name: "",
    description: "",
    is_mandatory: true,
  };
}

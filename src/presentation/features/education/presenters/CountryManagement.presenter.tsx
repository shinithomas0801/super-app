"use client";

import { ConfirmationDialog, Table } from "@/components";
import type { TableColumn } from "@/components";
import type { CountryRow } from "@/domain/education";
import { useRouter } from "next/navigation";
import { useState, type FormEvent } from "react";

type Props = {
  countries: CountryRow[];
};

export function CountryManagementPresenter({ countries }: Props) {
  const router = useRouter();
  const [isoCode, setIsoCode] = useState("");
  const [name, setName] = useState("");
  const [active, setActive] = useState(true);
  const [pending, setPending] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editIsoCode, setEditIsoCode] = useState("");
  const [editName, setEditName] = useState("");
  const [editActive, setEditActive] = useState(true);
  const [draggedId, setDraggedId] = useState<string | null>(null);
  const [countryToDelete, setCountryToDelete] = useState<string | null>(null);

  const orderedCountries = [...countries].sort(
    (a, b) => a.sort_order - b.sort_order || a.name.localeCompare(b.name)
  );

  function beginEdit(country: CountryRow) {
    setEditingId(country.id);
    setEditIsoCode(country.iso_code);
    setEditName(country.name);
    setEditActive(country.active);
  }

  async function requestJson(url: string, options: RequestInit) {
    const res = await fetch(url, {
      ...options,
      headers: {
        "content-type": "application/json",
        ...(options.headers ?? {}),
      },
    });
    const payload = (await res.json()) as { error?: string };
    if (!res.ok) throw new Error(payload.error || "Request failed.");
  }

  async function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setPending(true);
    setError(null);
    try {
      await requestJson("/api/education/countries", {
        method: "POST",
        body: JSON.stringify({
          iso_code: isoCode,
          name,
          active,
        }),
      });
      setIsoCode("");
      setName("");
      setActive(true);
      router.refresh();
    } catch (cause) {
      setError(
        cause instanceof Error ? cause.message : "Failed to create country."
      );
    } finally {
      setPending(false);
    }
  }

  async function saveEdit(id: string) {
    setPending(true);
    setError(null);
    try {
      await requestJson(`/api/education/countries/${id}`, {
        method: "PATCH",
        body: JSON.stringify({
          iso_code: editIsoCode,
          name: editName,
          active: editActive,
        }),
      });
      setEditingId(null);
      router.refresh();
    } catch (cause) {
      setError(
        cause instanceof Error ? cause.message : "Failed to update country."
      );
    } finally {
      setPending(false);
    }
  }

  async function removeCountry(id: string) {
    setPending(true);
    setError(null);
    try {
      await requestJson(`/api/education/countries/${id}`, { method: "DELETE" });
      router.refresh();
    } catch (cause) {
      setError(
        cause instanceof Error ? cause.message : "Failed to delete country."
      );
    } finally {
      setPending(false);
    }
  }

  async function reorderCountries(dragId: string, dropId: string) {
    if (dragId === dropId) return;
    const draggedIndex = orderedCountries.findIndex((c) => c.id === dragId);
    const dropIndex = orderedCountries.findIndex((c) => c.id === dropId);
    if (draggedIndex < 0 || dropIndex < 0) return;
    const reordered = [...orderedCountries];
    const [moved] = reordered.splice(draggedIndex, 1);
    reordered.splice(dropIndex, 0, moved);
    setPending(true);
    setError(null);
    try {
      await Promise.all(
        reordered.map((country, idx) =>
          requestJson(`/api/education/countries/${country.id}`, {
            method: "PATCH",
            body: JSON.stringify({ sort_order: (idx + 1) * 10 }),
          })
        )
      );
      router.refresh();
    } catch (cause) {
      setError(
        cause instanceof Error ? cause.message : "Failed to reorder country."
      );
    } finally {
      setPending(false);
      setDraggedId(null);
    }
  }

  const columns: TableColumn<CountryRow>[] = [
    {
      id: "drag",
      header: <span className="sr-only">Drag</span>,
      cellClassName: "max-w-none whitespace-nowrap",
      accessor: () => (
        <span
          className="inline-flex cursor-grab items-center text-gray-400 active:cursor-grabbing"
          aria-label="Drag to reorder"
        >
          <svg
            viewBox="0 0 20 20"
            fill="currentColor"
            className="h-4 w-4"
            aria-hidden="true"
          >
            <circle cx="6" cy="5" r="1.2" />
            <circle cx="6" cy="10" r="1.2" />
            <circle cx="6" cy="15" r="1.2" />
            <circle cx="14" cy="5" r="1.2" />
            <circle cx="14" cy="10" r="1.2" />
            <circle cx="14" cy="15" r="1.2" />
          </svg>
        </span>
      ),
    },
    {
      id: "name",
      header: "Name",
      accessor: (country) =>
        editingId === country.id ? (
          <input
            className="rounded border border-gray-300 px-2 py-1"
            value={editName}
            onChange={(event) => setEditName(event.target.value)}
          />
        ) : (
          country.name
        ),
    },
    {
      id: "iso",
      header: "ISO",
      accessor: (country) =>
        editingId === country.id ? (
          <input
            className="w-20 rounded border border-gray-300 px-2 py-1 uppercase"
            value={editIsoCode}
            maxLength={2}
            onChange={(event) =>
              setEditIsoCode(event.target.value.toUpperCase())
            }
          />
        ) : (
          country.iso_code
        ),
    },
    {
      id: "active",
      header: "Active",
      accessor: (country) =>
        editingId === country.id ? (
          <select
            className="rounded border border-gray-300 px-2 py-1"
            value={editActive ? "true" : "false"}
            onChange={(event) => setEditActive(event.target.value === "true")}
          >
            <option value="true">Yes</option>
            <option value="false">No</option>
          </select>
        ) : country.active ? (
          "Yes"
        ) : (
          "No"
        ),
    },
    {
      id: "actions",
      header: "Actions",
      cellClassName: "max-w-none",
      accessor: (country) => (
        <div className="flex gap-1">
          {editingId === country.id ? (
            <>
              <button
                type="button"
                className="rounded border border-gray-300 px-2 py-1 text-xs"
                onClick={() => saveEdit(country.id)}
                disabled={pending}
              >
                Save
              </button>
              <button
                type="button"
                className="rounded border border-gray-300 px-2 py-1 text-xs"
                onClick={() => setEditingId(null)}
              >
                Cancel
              </button>
            </>
          ) : (
            <>
              <button
                type="button"
                className="rounded border border-gray-300 px-2 py-1 text-xs"
                onClick={() => beginEdit(country)}
              >
                Edit
              </button>
              <button
                type="button"
                className="rounded border border-red-300 px-2 py-1 text-xs text-red-700"
                onClick={() => setCountryToDelete(country.id)}
                disabled={pending}
              >
                Delete
              </button>
            </>
          )}
        </div>
      ),
    },
  ];

  return (
    <div className="space-y-4">
      <div className="rounded-xl border border-gray-200 bg-gray-50 p-5">
        <h2 className="text-sm font-semibold text-gray-900">Add country</h2>
        <form className="mt-3 grid gap-3 md:grid-cols-4" onSubmit={onSubmit}>
          <label className="text-sm text-gray-700">
            <span className="mb-1 block">ISO code</span>
            <input
              value={isoCode}
              onChange={(event) => setIsoCode(event.target.value.toUpperCase())}
              maxLength={2}
              required
              className="w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm"
              placeholder="US"
            />
          </label>
          <label className="text-sm text-gray-700">
            <span className="mb-1 block">Name</span>
            <input
              value={name}
              onChange={(event) => setName(event.target.value)}
              required
              className="w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm"
              placeholder="United States"
            />
          </label>
          <label className="text-sm text-gray-700">
            <span className="mb-1 block">Status</span>
            <select
              value={active ? "true" : "false"}
              onChange={(event) => setActive(event.target.value === "true")}
              className="w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm"
            >
              <option value="true">Active</option>
              <option value="false">Inactive</option>
            </select>
          </label>
          <div className="self-end">
            <button
              type="submit"
              disabled={pending}
              className="w-full rounded-md bg-gray-900 px-4 py-2 text-sm font-medium text-white disabled:opacity-50"
            >
              {pending ? "Saving..." : "Add country"}
            </button>
          </div>
        </form>
        {error ? <p className="mt-2 text-sm text-red-600">{error}</p> : null}
      </div>

      <Table
        columns={columns}
        rows={orderedCountries}
        emptyLabel="No countries yet."
        getRowKey={(country) => country.id}
        getRowProps={(country) => ({
          draggable: !pending,
          onDragStart: () => setDraggedId(country.id),
          onDragOver: (event) => event.preventDefault(),
          onDrop: () => {
            if (draggedId) void reorderCountries(draggedId, country.id);
          },
          onDragEnd: () => setDraggedId(null),
          className: draggedId === country.id ? "opacity-60" : "",
        })}
        bodyRowClassName="align-top"
      />

      <ConfirmationDialog
        open={Boolean(countryToDelete)}
        title="Delete country?"
        description="This action cannot be undone."
        confirmLabel="Delete"
        pending={pending}
        onCancel={() => setCountryToDelete(null)}
        onConfirm={() => {
          if (!countryToDelete) return;
          void removeCountry(countryToDelete).finally(() =>
            setCountryToDelete(null)
          );
        }}
      />
    </div>
  );
}

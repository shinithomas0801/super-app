"use client";

import { useMemo, useState, type FormEvent } from "react";
import { useRouter } from "next/navigation";
import type {
  VisaChecklistFormState,
  VisaChecklistManagementProps,
} from "./types";
import type { VisaChecklistRow } from "@/domain/education";

function emptyForm(initialCountry: string): VisaChecklistFormState {
  return {
    country_id: initialCountry,
    document_name: "",
    description: "",
    is_mandatory: true,
  };
}

export function useVisaChecklistCrud({
  items: _items,
  countries,
}: VisaChecklistManagementProps) {
  void _items;
  const router = useRouter();
  const initialCountry = countries[0]?.id ?? "";
  const [createOpen, setCreateOpen] = useState(false);
  const [createForm, setCreateForm] = useState<VisaChecklistFormState>(() =>
    emptyForm(initialCountry)
  );
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editingForm, setEditingForm] = useState<VisaChecklistFormState | null>(
    null
  );
  const [pending, setPending] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const countryMap = useMemo(
    () => new Map(countries.map((c) => [c.id, c])),
    [countries]
  );

  async function requestJson(url: string, options: RequestInit) {
    const res = await fetch(url, {
      ...options,
      credentials: "same-origin",
      headers: {
        "content-type": "application/json",
        ...(options.headers ?? {}),
      },
    });
    const payload = (await res.json()) as { error?: string };
    if (!res.ok) throw new Error(payload.error || "Request failed");
  }

  async function createItem(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setPending(true);
    setError(null);
    try {
      await requestJson("/api/education/visa-checklist", {
        method: "POST",
        body: JSON.stringify({
          country_id: createForm.country_id,
          document_name: createForm.document_name.trim(),
          description: createForm.description.trim() || null,
          is_mandatory: createForm.is_mandatory,
        }),
      });
      setCreateForm(emptyForm(initialCountry));
      setCreateOpen(false);
      router.refresh();
    } catch (cause) {
      setError(
        cause instanceof Error ? cause.message : "Failed to create item."
      );
    } finally {
      setPending(false);
    }
  }

  function startEditing(row: VisaChecklistRow) {
    setEditingId(row.id);
    setEditingForm({
      country_id: row.country_id,
      document_name: row.document_name,
      description: row.description ?? "",
      is_mandatory: row.is_mandatory,
    });
  }

  async function saveEdit(id: string) {
    if (!editingForm) return;
    setPending(true);
    setError(null);
    try {
      await requestJson(`/api/education/visa-checklist/${id}`, {
        method: "PATCH",
        body: JSON.stringify({
          country_id: editingForm.country_id,
          document_name: editingForm.document_name.trim(),
          description: editingForm.description.trim() || null,
          is_mandatory: editingForm.is_mandatory,
        }),
      });
      setEditingId(null);
      setEditingForm(null);
      router.refresh();
    } catch (cause) {
      setError(
        cause instanceof Error ? cause.message : "Failed to update item."
      );
    } finally {
      setPending(false);
    }
  }

  async function removeItem(id: string) {
    setPending(true);
    setError(null);
    try {
      await requestJson(`/api/education/visa-checklist/${id}`, {
        method: "DELETE",
      });
      if (editingId === id) {
        setEditingId(null);
        setEditingForm(null);
      }
      router.refresh();
    } catch (cause) {
      setError(
        cause instanceof Error ? cause.message : "Failed to delete item."
      );
    } finally {
      setPending(false);
    }
  }

  return {
    createOpen,
    setCreateOpen,
    createForm,
    setCreateForm,
    editingId,
    setEditingId,
    editingForm,
    setEditingForm,
    pending,
    error,
    setError,
    countryMap,
    createItem,
    startEditing,
    saveEdit,
    removeItem,
    initialCountry,
  };
}

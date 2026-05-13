"use client";

import { useMemo, useState, type FormEvent } from "react";
import { useRouter } from "next/navigation";
import type { ScholarshipFormState, ScholarshipManagementProps } from "./types";
import type { ScholarshipRow } from "@/domain/education";

function emptyForm(initialUniversity: string): ScholarshipFormState {
  return {
    university_id: initialUniversity,
    course_id: "",
    name: "",
    amount: "",
    eligibility: "",
    deadline: "",
  };
}

export function useScholarshipCrud({
  scholarships: _scholarships,
  universities,
  courses,
}: ScholarshipManagementProps) {
  void _scholarships;
  const router = useRouter();
  const initialUniversity = universities[0]?.id ?? "";
  const [createOpen, setCreateOpen] = useState(false);
  const [createForm, setCreateForm] = useState<ScholarshipFormState>(() =>
    emptyForm(initialUniversity)
  );
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editingForm, setEditingForm] = useState<ScholarshipFormState | null>(
    null
  );
  const [pending, setPending] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const universityMap = useMemo(
    () => new Map(universities.map((u) => [u.id, u])),
    [universities]
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

  function payloadFromForm(form: ScholarshipFormState) {
    const amt = form.amount.trim();
    return {
      university_id: form.university_id,
      course_id: form.course_id.trim() || null,
      name: form.name.trim(),
      amount: amt === "" ? null : amt,
      eligibility: form.eligibility.trim() || null,
      deadline: form.deadline.trim() || null,
    };
  }

  async function createScholarship(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setPending(true);
    setError(null);
    try {
      await requestJson("/api/education/scholarships", {
        method: "POST",
        body: JSON.stringify(payloadFromForm(createForm)),
      });
      setCreateForm(emptyForm(initialUniversity));
      setCreateOpen(false);
      router.refresh();
    } catch (cause) {
      setError(
        cause instanceof Error ? cause.message : "Failed to create scholarship."
      );
    } finally {
      setPending(false);
    }
  }

  function startEditing(row: ScholarshipRow) {
    setEditingId(row.id);
    setEditingForm({
      university_id: row.university_id,
      course_id: row.course_id ?? "",
      name: row.name,
      amount: row.amount ?? "",
      eligibility: row.eligibility ?? "",
      deadline: row.deadline ? row.deadline.slice(0, 10) : "",
    });
  }

  async function saveEdit(id: string) {
    if (!editingForm) return;
    setPending(true);
    setError(null);
    try {
      await requestJson(`/api/education/scholarships/${id}`, {
        method: "PATCH",
        body: JSON.stringify(payloadFromForm(editingForm)),
      });
      setEditingId(null);
      setEditingForm(null);
      router.refresh();
    } catch (cause) {
      setError(
        cause instanceof Error ? cause.message : "Failed to update scholarship."
      );
    } finally {
      setPending(false);
    }
  }

  async function removeScholarship(id: string) {
    setPending(true);
    setError(null);
    try {
      await requestJson(`/api/education/scholarships/${id}`, {
        method: "DELETE",
      });
      if (editingId === id) {
        setEditingId(null);
        setEditingForm(null);
      }
      router.refresh();
    } catch (cause) {
      setError(
        cause instanceof Error ? cause.message : "Failed to delete scholarship."
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
    universityMap,
    createScholarship,
    startEditing,
    saveEdit,
    removeScholarship,
    initialUniversity,
  };
}

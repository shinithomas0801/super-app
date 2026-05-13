"use client";

import { useMemo, useState, type FormEvent } from "react";
import { useRouter } from "next/navigation";
import type { IntakeRow } from "@/domain/education";
import type { IntakeFormState, IntakeManagementProps } from "./types";

function emptyForm(initialCourseId: string): IntakeFormState {
  return {
    course_id: initialCourseId,
    name: "",
    start_date: "",
    application_deadline: "",
    seats_available: "",
  };
}

function seatsPayload(s: string): number | null {
  const t = s.trim();
  if (t === "") return null;
  const n = Number(t);
  return Number.isFinite(n) && n >= 0 ? Math.trunc(n) : null;
}

function payloadFromForm(form: IntakeFormState) {
  return {
    course_id: form.course_id.trim(),
    name: form.name.trim(),
    start_date: form.start_date.trim() || null,
    application_deadline: form.application_deadline.trim() || null,
    seats_available: seatsPayload(form.seats_available),
  };
}

export function useIntakeCrud({
  intakes: _intakes,
  courses,
}: IntakeManagementProps) {
  void _intakes;
  const router = useRouter();
  const initialCourseId = courses[0]?.id ?? "";
  const [createOpen, setCreateOpen] = useState(false);
  const [createForm, setCreateForm] = useState<IntakeFormState>(() =>
    emptyForm(initialCourseId)
  );
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editingForm, setEditingForm] = useState<IntakeFormState | null>(null);
  const [pending, setPending] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const courseMap = useMemo(
    () => new Map(courses.map((c) => [c.id, c])),
    [courses]
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

  async function createIntake(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setPending(true);
    setError(null);
    try {
      await requestJson("/api/education/intakes", {
        method: "POST",
        body: JSON.stringify(payloadFromForm(createForm)),
      });
      setCreateForm(emptyForm(initialCourseId));
      setCreateOpen(false);
      router.refresh();
    } catch (cause) {
      setError(
        cause instanceof Error ? cause.message : "Failed to create intake."
      );
    } finally {
      setPending(false);
    }
  }

  function startEditing(row: IntakeRow) {
    setEditingId(row.id);
    setEditingForm({
      course_id: row.course_id,
      name: row.name,
      start_date: row.start_date ? row.start_date.slice(0, 10) : "",
      application_deadline: row.application_deadline
        ? row.application_deadline.slice(0, 10)
        : "",
      seats_available:
        row.seats_available != null ? String(row.seats_available) : "",
    });
  }

  async function saveEdit(id: string) {
    if (!editingForm) return;
    setPending(true);
    setError(null);
    try {
      await requestJson(`/api/education/intakes/${id}`, {
        method: "PATCH",
        body: JSON.stringify(payloadFromForm(editingForm)),
      });
      setEditingId(null);
      setEditingForm(null);
      router.refresh();
    } catch (cause) {
      setError(
        cause instanceof Error ? cause.message : "Failed to update intake."
      );
    } finally {
      setPending(false);
    }
  }

  async function removeIntake(id: string) {
    setPending(true);
    setError(null);
    try {
      await requestJson(`/api/education/intakes/${id}`, {
        method: "DELETE",
      });
      if (editingId === id) {
        setEditingId(null);
        setEditingForm(null);
      }
      router.refresh();
    } catch (cause) {
      setError(
        cause instanceof Error ? cause.message : "Failed to delete intake."
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
    courseMap,
    createIntake,
    startEditing,
    saveEdit,
    removeIntake,
    initialCourseId,
  };
}

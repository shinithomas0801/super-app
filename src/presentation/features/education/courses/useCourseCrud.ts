"use client";

import { useMemo, useState, type FormEvent } from "react";
import { useRouter } from "next/navigation";
import type { CourseCreateFormState, CourseManagementProps } from "./types";
import type { CourseRow } from "@/domain/education";

export function useCourseCrud({
  courses: _courses,
  universities,
}: CourseManagementProps) {
  void _courses;
  const router = useRouter();
  const initialUniversity = universities[0]?.id ?? "";
  const [createOpen, setCreateOpen] = useState(false);
  const [createForm, setCreateForm] = useState<CourseCreateFormState>({
    university_id: initialUniversity,
    name: "",
    degree: "",
    field_of_study: "",
    duration_months: "",
    tuition_fee: "",
    currency: "",
    min_qualification: "",
  });
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editingForm, setEditingForm] = useState<CourseCreateFormState | null>(
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

  async function createCourse(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setPending(true);
    setError(null);
    try {
      const dm = createForm.duration_months.trim();
      const tf = createForm.tuition_fee.trim();
      await requestJson("/api/education/courses", {
        method: "POST",
        body: JSON.stringify({
          university_id: createForm.university_id,
          name: createForm.name.trim(),
          degree: createForm.degree.trim() || null,
          field_of_study: createForm.field_of_study.trim() || null,
          duration_months: dm === "" ? null : dm,
          tuition_fee: tf === "" ? null : tf,
          currency: createForm.currency.trim() || null,
          min_qualification: createForm.min_qualification.trim() || null,
        }),
      });
      setCreateForm({
        university_id: initialUniversity,
        name: "",
        degree: "",
        field_of_study: "",
        duration_months: "",
        tuition_fee: "",
        currency: "",
        min_qualification: "",
      });
      setCreateOpen(false);
      router.refresh();
    } catch (cause) {
      setError(
        cause instanceof Error ? cause.message : "Failed to create course."
      );
    } finally {
      setPending(false);
    }
  }

  function startEditing(course: CourseRow) {
    setEditingId(course.id);
    setEditingForm({
      university_id: course.university_id,
      name: course.name,
      degree: course.degree ?? "",
      field_of_study: course.field_of_study ?? "",
      duration_months:
        course.duration_months != null ? String(course.duration_months) : "",
      tuition_fee: course.tuition_fee ?? "",
      currency: course.currency ?? "",
      min_qualification: course.min_qualification ?? "",
    });
  }

  async function saveEdit(id: string) {
    if (!editingForm) return;
    setPending(true);
    setError(null);
    try {
      const dm = editingForm.duration_months.trim();
      const tf = editingForm.tuition_fee.trim();
      await requestJson(`/api/education/courses/${id}`, {
        method: "PATCH",
        body: JSON.stringify({
          university_id: editingForm.university_id,
          name: editingForm.name.trim(),
          degree: editingForm.degree.trim() || null,
          field_of_study: editingForm.field_of_study.trim() || null,
          duration_months: dm === "" ? null : dm,
          tuition_fee: tf === "" ? null : tf,
          currency: editingForm.currency.trim() || null,
          min_qualification: editingForm.min_qualification.trim() || null,
        }),
      });
      setEditingId(null);
      setEditingForm(null);
      router.refresh();
    } catch (cause) {
      setError(
        cause instanceof Error ? cause.message : "Failed to update course."
      );
    } finally {
      setPending(false);
    }
  }

  async function removeCourse(id: string) {
    setPending(true);
    setError(null);
    try {
      await requestJson(`/api/education/courses/${id}`, {
        method: "DELETE",
      });
      if (editingId === id) {
        setEditingId(null);
        setEditingForm(null);
      }
      router.refresh();
    } catch (cause) {
      setError(
        cause instanceof Error ? cause.message : "Failed to delete course."
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
    createCourse,
    startEditing,
    saveEdit,
    removeCourse,
  };
}

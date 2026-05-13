"use client";

import { useMemo, useState, type FormEvent } from "react";
import { useRouter } from "next/navigation";
import type { UniversityManagementProps, UniversityFormState } from "./types";
import type { UniversityRow } from "@/domain/education";

function formRankingToApiValue(ranking: string): number | null {
  const t = ranking.trim();
  if (!t) return null;
  const n = Number(t);
  if (!Number.isFinite(n)) {
    throw new Error("Ranking must be a finite number.");
  }
  return Math.trunc(n);
}

export function useUniversityCrud({
  universities,
  countries,
}: UniversityManagementProps) {
  const router = useRouter();
  const initialCountry = countries[0]?.id ?? "";
  const [createOpen, setCreateOpen] = useState(false);
  const [createForm, setCreateForm] = useState<UniversityFormState>({
    country_id: initialCountry,
    name: "",
    city: "",
    website_url: "",
    ranking: "",
  });
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editingForm, setEditingForm] = useState<UniversityFormState | null>(
    null
  );
  const [pending, setPending] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const countryMap = useMemo(
    () => new Map(countries.map((country) => [country.id, country])),
    [countries]
  );

  async function requestJson(url: string, options: RequestInit) {
    const res = await fetch(url, {
      ...options,
      headers: {
        "content-type": "application/json",
        ...(options.headers ?? {}),
      },
    });
    const payload = (await res.json()) as { error?: string };
    if (!res.ok) throw new Error(payload.error || "Request failed");
  }

  async function createUniversity(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setPending(true);
    setError(null);
    try {
      await requestJson("/api/education/universities", {
        method: "POST",
        body: JSON.stringify({
          country_id: createForm.country_id,
          name: createForm.name,
          city: createForm.city.trim() || null,
          website_url: createForm.website_url || null,
          ranking: formRankingToApiValue(createForm.ranking),
        }),
      });
      setCreateForm({
        country_id: initialCountry,
        name: "",
        city: "",
        website_url: "",
        ranking: "",
      });
      setCreateOpen(false);
      router.refresh();
    } catch (cause) {
      setError(
        cause instanceof Error ? cause.message : "Failed to create university."
      );
    } finally {
      setPending(false);
    }
  }

  function startEditing(university: UniversityRow) {
    setEditingId(university.id);
    setEditingForm({
      country_id: university.country_id,
      name: university.name,
      city: university.city ?? "",
      website_url: university.website_url ?? "",
      ranking: university.ranking != null ? String(university.ranking) : "",
    });
  }

  async function saveEdit(id: string) {
    if (!editingForm) return;
    setPending(true);
    setError(null);
    try {
      await requestJson(`/api/education/universities/${id}`, {
        method: "PATCH",
        body: JSON.stringify({
          country_id: editingForm.country_id,
          name: editingForm.name,
          city: editingForm.city.trim() || null,
          website_url: editingForm.website_url || null,
          ranking: formRankingToApiValue(editingForm.ranking),
        }),
      });
      setEditingId(null);
      setEditingForm(null);
      router.refresh();
    } catch (cause) {
      setError(
        cause instanceof Error ? cause.message : "Failed to update university."
      );
    } finally {
      setPending(false);
    }
  }

  async function removeUniversity(id: string) {
    setPending(true);
    setError(null);
    try {
      await requestJson(`/api/education/universities/${id}`, {
        method: "DELETE",
      });
      if (editingId === id) {
        setEditingId(null);
        setEditingForm(null);
      }
      router.refresh();
    } catch (cause) {
      setError(
        cause instanceof Error ? cause.message : "Failed to delete university."
      );
    } finally {
      setPending(false);
    }
  }

  return {
    universities,
    countries,
    countryMap,
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
    createUniversity,
    startEditing,
    saveEdit,
    removeUniversity,
  };
}

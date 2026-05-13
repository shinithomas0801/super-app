"use client";

import { useRouter } from "next/navigation";
import { useState, type FormEvent } from "react";
import type { StudentProfileRow } from "@/domain/education";

type Props = {
  students: StudentProfileRow[];
};

export function MarkListUploadFormPresenter({ students }: Props) {
  const router = useRouter();
  const [studentId, setStudentId] = useState(students[0]?.id ?? "");
  const [status, setStatus] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [pending, setPending] = useState(false);

  async function onSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setStatus(null);
    setError(null);
    const form = e.currentTarget;
    const input = form.elements.namedItem("file") as HTMLInputElement;
    const file = input?.files?.[0];
    if (!studentId || !file) {
      setError("Choose a student and a file.");
      return;
    }
    setPending(true);
    try {
      const body = new FormData();
      body.set("studentId", studentId);
      body.set("file", file);
      const res = await fetch("/api/education/mark-list-upload", {
        method: "POST",
        body,
      });
      const json = (await res.json()) as { ok?: boolean; error?: string };
      if (!res.ok) {
        setError(json.error ?? "Upload failed");
        return;
      }
      setStatus("Uploaded and recorded.");
      form.reset();
      router.refresh();
    } catch {
      setError("Network error");
    } finally {
      setPending(false);
    }
  }

  return (
    <div className="mb-8 rounded-xl border border-gray-200 bg-gray-50/80 p-5">
      <h2 className="text-sm font-semibold text-gray-900">Upload mark list</h2>
      <p className="mt-1 text-xs text-gray-600">
        Files go to private Storage; metadata is stored in{" "}
        <code className="rounded bg-white px-1">education_mark_list_uploads</code>.
      </p>
      <form className="mt-4 flex flex-col gap-3 sm:flex-row sm:items-end" onSubmit={onSubmit}>
        <label className="flex flex-col gap-1 text-sm">
          <span className="text-gray-600">Student</span>
          <select
            className="rounded-md border border-gray-300 bg-white px-3 py-2 text-sm"
            value={studentId}
            onChange={(ev) => setStudentId(ev.target.value)}
            disabled={students.length === 0}
          >
            {students.length === 0 ? (
              <option value="">No students yet</option>
            ) : (
              students.map((s) => (
                <option key={s.id} value={s.id}>
                  {s.full_name}
                  {s.email ? ` (${s.email})` : ""}
                </option>
              ))
            )}
          </select>
        </label>
        <label className="flex flex-col gap-1 text-sm flex-1">
          <span className="text-gray-600">File</span>
          <input
            name="file"
            type="file"
            accept=".pdf,.png,.jpg,.jpeg,.xlsx,.xls"
            className="text-sm file:mr-3 file:rounded-md file:border-0 file:bg-gray-900 file:px-3 file:py-2 file:text-xs file:font-medium file:text-white"
          />
        </label>
        <button
          type="submit"
          disabled={pending || students.length === 0}
          className="rounded-md bg-gray-900 px-4 py-2 text-sm font-medium text-white hover:bg-gray-800 disabled:opacity-50"
        >
          {pending ? "Uploading…" : "Upload"}
        </button>
      </form>
      {error ? <p className="mt-2 text-sm text-red-600">{error}</p> : null}
      {status ? <p className="mt-2 text-sm text-green-700">{status}</p> : null}
    </div>
  );
}

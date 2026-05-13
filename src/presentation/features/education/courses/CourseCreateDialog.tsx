import type { FormEvent } from "react";
import type { UniversityRow } from "@/domain/education";
import type { CourseCreateFormState } from "./types";
import { CourseFormFields } from "./CourseFormFields";

type Props = {
  open: boolean;
  pending: boolean;
  universities: UniversityRow[];
  form: CourseCreateFormState;
  onChange: (next: CourseCreateFormState) => void;
  onClose: () => void;
  onSubmit: (event: FormEvent<HTMLFormElement>) => void;
};

export function CourseCreateDialog({
  open,
  pending,
  universities,
  form,
  onChange,
  onClose,
  onSubmit,
}: Props) {
  if (!open) return null;
  const hasUniversities = universities.length > 0;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
      <form
        className="max-h-[90vh] w-full max-w-2xl overflow-y-auto rounded-xl bg-white p-5 shadow-lg"
        onSubmit={onSubmit}
      >
        <div className="mb-4 flex items-start justify-between gap-3">
          <div>
            <h2 className="text-lg font-semibold text-gray-900">
              Create course
            </h2>
            <p className="text-sm text-gray-600">
              Add a program linked to a university (
              <code className="rounded bg-gray-100 px-1 text-xs">
                education_module.courses
              </code>
              ).
            </p>
          </div>
          <button
            type="button"
            className="rounded border border-gray-300 px-2 py-1 text-xs"
            onClick={onClose}
          >
            Close
          </button>
        </div>

        <CourseFormFields
          form={form}
          onChange={onChange}
          universities={universities}
          pending={pending}
        />

        <div className="mt-5 flex justify-end gap-2">
          <button
            type="button"
            className="rounded border border-gray-300 px-3 py-2 text-sm"
            onClick={onClose}
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={pending || !hasUniversities || !form.name.trim()}
            className="rounded-md bg-gray-900 px-4 py-2 text-sm font-medium text-white disabled:opacity-50"
          >
            {pending ? "Saving…" : "Create"}
          </button>
        </div>
      </form>
    </div>
  );
}

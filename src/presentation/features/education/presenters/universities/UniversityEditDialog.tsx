import { X } from "lucide-react";
import type { CountryRow } from "@/domain/education";
import type { UniversityFormState } from "./types";
import { UniversityFormFields } from "./UniversityFormFields";

type Props = {
  open: boolean;
  pending: boolean;
  countries: CountryRow[];
  form: UniversityFormState | null;
  onChange: (next: UniversityFormState) => void;
  onClose: () => void;
  onSubmit: () => void;
};

export function UniversityEditDialog({
  open,
  pending,
  countries,
  form,
  onChange,
  onClose,
  onSubmit,
}: Props) {
  if (!open || !form) return null;
  const hasCountries = countries.length > 0;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
      <form
        className="w-full max-w-2xl rounded-xl bg-white p-5 shadow-lg"
        onSubmit={(event) => {
          event.preventDefault();
          onSubmit();
        }}
      >
        <div className="mb-4 flex items-start justify-between gap-3">
          <div>
            <h2 className="text-lg font-semibold text-gray-900">
              Edit university
            </h2>
            <p className="text-sm text-gray-600">
              Update catalog details for this university.
            </p>
          </div>
          <button
            type="button"
            className="inline-flex h-8 w-8 shrink-0 items-center justify-center rounded-md border border-gray-300 text-gray-600 hover:bg-gray-50"
            onClick={onClose}
            aria-label="Close"
          >
            <X className="h-4 w-4" strokeWidth={2} aria-hidden />
          </button>
        </div>

        <UniversityFormFields
          form={form}
          countries={countries}
          onChange={onChange}
        />
        {!hasCountries ? (
          <p className="mt-3 text-sm text-amber-700">
            No countries available. Add at least one country before editing
            university country mappings.
          </p>
        ) : null}
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
            disabled={pending || !hasCountries}
            className="rounded-md bg-gray-900 px-4 py-2 text-sm font-medium text-white disabled:opacity-50"
          >
            {pending ? "Saving..." : "Save changes"}
          </button>
        </div>
      </form>
    </div>
  );
}

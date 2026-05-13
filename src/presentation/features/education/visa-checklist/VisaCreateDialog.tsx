import type { FormEvent } from "react";
import type { CountryRow } from "@/domain/education";
import type { VisaChecklistFormState } from "./types";
import { VisaFormFields } from "./VisaFormFields";

type Props = {
  open: boolean;
  pending: boolean;
  countries: CountryRow[];
  form: VisaChecklistFormState;
  onChange: (next: VisaChecklistFormState) => void;
  onClose: () => void;
  onSubmit: (event: FormEvent<HTMLFormElement>) => void;
};

export function VisaCreateDialog({
  open,
  pending,
  countries,
  form,
  onChange,
  onClose,
  onSubmit,
}: Props) {
  if (!open) return null;
  const hasCountries = countries.length > 0;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
      <form
        className="max-h-[90vh] w-full max-w-lg overflow-y-auto rounded-xl bg-white p-5 shadow-lg"
        onSubmit={onSubmit}
      >
        <div className="mb-4 flex items-start justify-between gap-3">
          <div>
            <h2 className="text-lg font-semibold text-gray-900">
              Add checklist item
            </h2>
            <p className="text-sm text-gray-600">
              One document or step per row for a destination country.
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

        <VisaFormFields
          form={form}
          onChange={onChange}
          countries={countries}
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
            disabled={pending || !hasCountries || !form.document_name.trim()}
            className="rounded-md bg-gray-900 px-4 py-2 text-sm font-medium text-white disabled:opacity-50"
          >
            {pending ? "Saving…" : "Create"}
          </button>
        </div>
      </form>
    </div>
  );
}

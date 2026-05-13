import { X } from "lucide-react";
import type { CountryRow } from "@/domain/education";
import type { VisaChecklistFormState } from "./types";
import { VisaFormFields } from "./VisaFormFields";

type Props = {
  open: boolean;
  pending: boolean;
  countries: CountryRow[];
  form: VisaChecklistFormState | null;
  onChange: (next: VisaChecklistFormState) => void;
  onClose: () => void;
  onSubmit: () => void;
};

export function VisaEditDialog({
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
        className="max-h-[90vh] w-full max-w-lg overflow-y-auto rounded-xl bg-white p-5 shadow-lg"
        onSubmit={(e) => {
          e.preventDefault();
          onSubmit();
        }}
      >
        <div className="mb-4 flex items-start justify-between gap-3">
          <div>
            <h2 className="text-lg font-semibold text-gray-900">
              Edit checklist item
            </h2>
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
            {pending ? "Saving…" : "Save changes"}
          </button>
        </div>
      </form>
    </div>
  );
}

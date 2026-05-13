"use client";

import { Button } from "@/components/Button/Button";

type Props = {
  open: boolean;
  title: string;
  description: string;
  confirmLabel?: string;
  cancelLabel?: string;
  pending?: boolean;
  onConfirm: () => void;
  onCancel: () => void;
};

export function ConfirmationDialog({
  open,
  title,
  description,
  confirmLabel = "Confirm",
  cancelLabel = "Cancel",
  pending = false,
  onConfirm,
  onCancel,
}: Props) {
  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
      <div className="w-full max-w-md rounded-xl bg-white p-5 shadow-lg">
        <h2 className="text-lg font-semibold text-gray-900">{title}</h2>
        <p className="mt-2 text-sm text-gray-600">{description}</p>
        <div className="mt-5 flex justify-end gap-2">
          <Button
            type="button"
            variant="outline"
            onClick={onCancel}
            disabled={pending}
          >
            {cancelLabel}
          </Button>
          <Button
            type="button"
            variant="danger"
            onClick={onConfirm}
            disabled={pending}
          >
            {pending ? "Deleting..." : confirmLabel}
          </Button>
        </div>
      </div>
    </div>
  );
}

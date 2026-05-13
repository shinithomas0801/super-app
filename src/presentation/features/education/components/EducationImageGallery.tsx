"use client";

import { useEffect, useState, type FormEvent, type ReactNode } from "react";
import { useRouter } from "next/navigation";
/** Minimal row shape for university or course image rows. */
export type EducationGalleryImageRow = {
  id: string;
  file_path: string;
  is_primary: boolean;
};

export type EducationImageGalleryProps = {
  images: EducationGalleryImageRow[];
  /** POST (JSON + PATCH + DELETE ?image_id=), e.g. `/api/education/universities/:id/images` */
  imagesApiPath: string;
  /** POST multipart upload, e.g. `/api/education/universities/:id/images/upload` */
  uploadApiPath: string;
  resolveImageSrc: (file_path: string) => string;
  /** Section title */
  title?: string;
  /** Intro under title; omit for default copy */
  description?: ReactNode;
};

export function EducationImageGallery({
  images: initialImages,
  imagesApiPath,
  uploadApiPath,
  resolveImageSrc,
  title = "Images",
  description,
}: EducationImageGalleryProps) {
  const router = useRouter();
  const [images, setImages] =
    useState<EducationGalleryImageRow[]>(initialImages);
  const [filePath, setFilePath] = useState("");
  const [uploadFiles, setUploadFiles] = useState<File[]>([]);
  const [pending, setPending] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    setImages(initialImages);
  }, [initialImages]);

  async function requestJson(
    url: string,
    options: RequestInit
  ): Promise<unknown> {
    const res = await fetch(url, {
      ...options,
      credentials: "same-origin",
      headers: {
        "content-type": "application/json",
        ...(options.headers ?? {}),
      },
    });
    const payload = (await res.json()) as {
      error?: string;
      row?: EducationGalleryImageRow;
    };
    if (!res.ok) throw new Error(payload.error || "Request failed");
    return payload;
  }

  async function addImage(event: FormEvent) {
    event.preventDefault();
    const trimmed = filePath.trim();
    if (!trimmed) return;
    setPending(true);
    setError(null);
    try {
      const payload = (await requestJson(imagesApiPath, {
        method: "POST",
        body: JSON.stringify({ file_path: trimmed }),
      })) as { row?: EducationGalleryImageRow };
      if (payload.row) setImages((prev) => [...prev, payload.row!]);
      setFilePath("");
      router.refresh();
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : "Failed to add image.");
    } finally {
      setPending(false);
    }
  }

  async function uploadFromBucket(event: FormEvent) {
    event.preventDefault();
    if (uploadFiles.length === 0) return;
    setPending(true);
    setError(null);
    try {
      const formData = new FormData();
      for (const file of uploadFiles) {
        formData.append("file", file);
      }
      const res = await fetch(uploadApiPath, {
        method: "POST",
        body: formData,
        credentials: "same-origin",
      });
      const text = await res.text();
      let payload: {
        error?: string;
        row?: EducationGalleryImageRow;
        rows?: EducationGalleryImageRow[];
      };
      try {
        payload = text ? (JSON.parse(text) as typeof payload) : {};
      } catch {
        throw new Error(
          res.ok
            ? "Invalid response from server."
            : `Upload failed (${res.status}).`
        );
      }
      if (!res.ok) throw new Error(payload.error || "Upload failed");
      const newRows = payload.rows?.length
        ? payload.rows
        : payload.row
          ? [payload.row]
          : [];
      if (newRows.length > 0) {
        setImages((prev) => [...prev, ...newRows]);
      }
      setUploadFiles([]);
      router.refresh();
    } catch (cause) {
      const message =
        cause instanceof TypeError && cause.message === "Failed to fetch"
          ? "Network error — check that the dev server is running and you are signed in."
          : cause instanceof Error
            ? cause.message
            : "Failed to upload image.";
      setError(message);
    } finally {
      setPending(false);
    }
  }

  async function setPrimary(imageId: string) {
    setPending(true);
    setError(null);
    try {
      await requestJson(imagesApiPath, {
        method: "PATCH",
        body: JSON.stringify({ primary_image_id: imageId }),
      });
      setImages((prev) =>
        prev.map((img) => ({
          ...img,
          is_primary: img.id === imageId,
        }))
      );
      router.refresh();
    } catch (cause) {
      setError(
        cause instanceof Error ? cause.message : "Failed to set primary image."
      );
    } finally {
      setPending(false);
    }
  }

  async function removeImage(imageId: string) {
    setPending(true);
    setError(null);
    try {
      const url = `${imagesApiPath}?image_id=${encodeURIComponent(imageId)}`;
      const res = await fetch(url, {
        method: "DELETE",
        credentials: "same-origin",
      });
      const payload = (await res.json()) as { error?: string };
      if (!res.ok) throw new Error(payload.error || "Request failed");
      setImages((prev) => prev.filter((img) => img.id !== imageId));
      router.refresh();
    } catch (cause) {
      setError(
        cause instanceof Error ? cause.message : "Failed to remove image."
      );
    } finally {
      setPending(false);
    }
  }

  const defaultDescription = (
    <p className="mt-1 text-sm text-gray-600">
      Select one or more images (multi-select). Files are uploaded via your
      Storage upload API; paths are stored for previews. You can also paste an
      external image URL. Mark one image as primary for listings.
    </p>
  );

  return (
    <section className="rounded-lg border border-gray-200 bg-white p-5 shadow-sm">
      <h2 className="text-lg font-semibold text-gray-900">{title}</h2>
      {description ?? defaultDescription}

      {error ? (
        <p className="mt-3 text-sm text-red-600" role="alert">
          {error}
        </p>
      ) : null}

      <form
        onSubmit={(e) => void uploadFromBucket(e)}
        className="mt-4 flex flex-wrap items-end gap-3 rounded-md border border-dashed border-gray-300 bg-gray-50/80 p-4"
      >
        <label className="min-w-[200px] flex-1 text-sm text-gray-700">
          <span className="mb-1 block">Upload to bucket</span>
          <input
            type="file"
            multiple
            accept="image/jpeg,image/png,image/webp,image/gif,image/svg+xml"
            className="w-full text-sm file:mr-3 file:rounded file:border-0 file:bg-gray-200 file:px-3 file:py-1.5 file:text-sm"
            disabled={pending}
            onChange={(e) => setUploadFiles(Array.from(e.target.files ?? []))}
          />
          {uploadFiles.length > 0 ? (
            <p className="mt-1 text-xs text-gray-500">
              {uploadFiles.length} file{uploadFiles.length === 1 ? "" : "s"}{" "}
              selected
            </p>
          ) : null}
        </label>
        <button
          type="submit"
          disabled={pending || uploadFiles.length === 0}
          className="rounded-md bg-gray-900 px-4 py-2 text-sm font-medium text-white disabled:opacity-50"
        >
          {pending ? "Uploading…" : "Upload"}
        </button>
      </form>

      <form
        onSubmit={(e) => void addImage(e)}
        className="mt-4 flex flex-wrap items-end gap-2"
      >
        <label className="min-w-[200px] flex-1 text-sm text-gray-700">
          <span className="mb-1 block">External image URL (optional)</span>
          <input
            className="w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm"
            placeholder="https://…"
            value={filePath}
            onChange={(e) => setFilePath(e.target.value)}
            disabled={pending}
          />
        </label>
        <button
          type="submit"
          disabled={pending || !filePath.trim()}
          className="rounded-md bg-gray-900 px-4 py-2 text-sm font-medium text-white disabled:opacity-50"
        >
          {pending ? "Adding…" : "Add link"}
        </button>
      </form>

      {images.length === 0 ? (
        <p className="mt-6 text-sm text-gray-500">No images yet.</p>
      ) : (
        <ul className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {images.map((img) => (
            <li
              key={img.id}
              className="overflow-hidden rounded-lg border border-gray-200 bg-gray-50"
            >
              <div className="aspect-video bg-gray-200">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={resolveImageSrc(img.file_path)}
                  alt=""
                  className="h-full w-full object-cover"
                />
              </div>
              <div className="space-y-2 p-3">
                <p className="break-all font-mono text-xs text-gray-700">
                  {img.file_path}
                </p>
                {img.is_primary ? (
                  <span className="inline-block rounded-full bg-emerald-100 px-2 py-0.5 text-xs font-medium text-emerald-800">
                    Primary
                  </span>
                ) : null}
                <div className="flex flex-wrap gap-2">
                  {!img.is_primary ? (
                    <button
                      type="button"
                      disabled={pending}
                      className="rounded border border-gray-300 bg-white px-2 py-1 text-xs hover:bg-gray-50 disabled:opacity-50"
                      onClick={() => void setPrimary(img.id)}
                    >
                      Set as primary
                    </button>
                  ) : null}
                  <button
                    type="button"
                    disabled={pending}
                    className="rounded border border-red-200 bg-white px-2 py-1 text-xs text-red-700 hover:bg-red-50 disabled:opacity-50"
                    onClick={() => void removeImage(img.id)}
                  >
                    Remove
                  </button>
                </div>
              </div>
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}

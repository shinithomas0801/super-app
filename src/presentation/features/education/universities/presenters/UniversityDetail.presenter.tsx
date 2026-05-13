"use client";

import Link from "next/link";
import type { EducationUniversityDetail } from "@/application/education";
import { ROUTES } from "@/lib/constants";
import { EducationDetailGuidanceBlocks } from "../../components/EducationDetailGuidanceBlocks";
import { EducationImageGallery } from "../../shared/components";
import { resolveUniversityImageSrc } from "../resolve-university-image-src";

type Props = {
  detail: EducationUniversityDetail;
};

export function UniversityDetailPresenter({ detail }: Props) {
  const { university, countryName, images, scholarships, visaChecklist } =
    detail;
  const base = `/api/education/universities/${university.id}`;

  return (
    <div className="space-y-8">
      <div>
        <Link
          href={ROUTES.EDUCATION_UNIVERSITIES}
          className="text-sm text-gray-600 hover:text-gray-900"
        >
          ← Back to universities
        </Link>
        <h1 className="mt-3 text-2xl font-bold text-gray-900">
          {university.name}
        </h1>
      </div>

      <section className="rounded-lg border border-gray-200 bg-white p-5 shadow-sm">
        <h2 className="text-lg font-semibold text-gray-900">Details</h2>
        <dl className="mt-4 grid gap-3 text-sm sm:grid-cols-2">
          <div>
            <dt className="text-gray-500">ID</dt>
            <dd className="mt-0.5 font-mono text-xs text-gray-900 break-all">
              {university.id}
            </dd>
          </div>
          <div>
            <dt className="text-gray-500">Country</dt>
            <dd className="mt-0.5 text-gray-900">{countryName}</dd>
          </div>
          <div>
            <dt className="text-gray-500">City</dt>
            <dd className="mt-0.5 text-gray-900">{university.city ?? "—"}</dd>
          </div>
          <div>
            <dt className="text-gray-500">Ranking</dt>
            <dd className="mt-0.5 text-gray-900">
              {university.ranking != null ? String(university.ranking) : "—"}
            </dd>
          </div>
          <div className="sm:col-span-2">
            <dt className="text-gray-500">Website</dt>
            <dd className="mt-0.5 text-gray-900 break-all">
              {university.website_url ? (
                <a
                  href={university.website_url}
                  className="text-blue-700 underline"
                  target="_blank"
                  rel="noreferrer"
                >
                  {university.website_url}
                </a>
              ) : (
                "—"
              )}
            </dd>
          </div>
        </dl>
      </section>

      <EducationDetailGuidanceBlocks
        scholarships={scholarships}
        visaChecklist={visaChecklist}
      />

      <EducationImageGallery
        images={images}
        imagesApiPath={`${base}/images`}
        uploadApiPath={`${base}/images/upload`}
        resolveImageSrc={resolveUniversityImageSrc}
        description={
          <p className="mt-1 text-sm text-gray-600">
            Select one or more images (multi-select). Files go to the Supabase
            Storage bucket{" "}
            <code className="rounded bg-gray-100 px-1 text-xs">
              university_images
            </code>{" "}
            (linked in{" "}
            <code className="rounded bg-gray-100 px-1 text-xs">
              university_images.file_path
            </code>
            ), or paste an external image URL. Mark one image as primary for
            listings.
          </p>
        }
      />
    </div>
  );
}

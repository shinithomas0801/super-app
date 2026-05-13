"use client";

import Link from "next/link";
import type { EducationCourseDetail } from "@/application/education";
import { ROUTES } from "@/lib/constants";
import { EducationDetailGuidanceBlocks } from "../../components/EducationDetailGuidanceBlocks";
import { EducationImageGallery } from "../../shared/components";
import { resolveCourseImageSrc } from "../resolve-course-image-src";

type Props = {
  detail: EducationCourseDetail;
};

export function CourseDetailPresenter({ detail }: Props) {
  const { course, images, universityName, scholarships, visaChecklist } =
    detail;
  const base = `/api/education/courses/${course.id}`;

  return (
    <div className="space-y-8">
      <div>
        <Link
          href={ROUTES.EDUCATION_COURSES}
          className="text-sm text-gray-600 hover:text-gray-900"
        >
          ← Back to courses
        </Link>
        <h1 className="mt-3 text-2xl font-bold text-gray-900">{course.name}</h1>
      </div>

      <section className="rounded-lg border border-gray-200 bg-white p-5 shadow-sm">
        <h2 className="text-lg font-semibold text-gray-900">Details</h2>
        <dl className="mt-4 grid gap-3 text-sm sm:grid-cols-2">
          <div>
            <dt className="text-gray-500">ID</dt>
            <dd className="mt-0.5 font-mono text-xs text-gray-900 break-all">
              {course.id}
            </dd>
          </div>
          <div>
            <dt className="text-gray-500">University</dt>
            <dd className="mt-0.5 text-gray-900">{universityName}</dd>
          </div>
          <div>
            <dt className="text-gray-500">Degree</dt>
            <dd className="mt-0.5 text-gray-900">{course.degree ?? "—"}</dd>
          </div>
          <div>
            <dt className="text-gray-500">Field of study</dt>
            <dd className="mt-0.5 text-gray-900">
              {course.field_of_study ?? "—"}
            </dd>
          </div>
          <div>
            <dt className="text-gray-500">Duration (months)</dt>
            <dd className="mt-0.5 text-gray-900">
              {course.duration_months != null
                ? String(course.duration_months)
                : "—"}
            </dd>
          </div>
          <div>
            <dt className="text-gray-500">Tuition</dt>
            <dd className="mt-0.5 text-gray-900">
              {course.tuition_fee != null
                ? `${course.tuition_fee}${course.currency ? ` ${course.currency}` : ""}`
                : "—"}
            </dd>
          </div>
          <div className="sm:col-span-2">
            <dt className="text-gray-500">Min. qualification</dt>
            <dd className="mt-0.5 text-gray-900">
              {course.min_qualification ?? "—"}
            </dd>
          </div>
        </dl>
      </section>

      <EducationDetailGuidanceBlocks
        scholarships={scholarships}
        visaChecklist={visaChecklist}
        courseId={course.id}
      />

      <EducationImageGallery
        images={images}
        imagesApiPath={`${base}/images`}
        uploadApiPath={`${base}/images/upload`}
        resolveImageSrc={resolveCourseImageSrc}
        description={
          <p className="mt-1 text-sm text-gray-600">
            Select one or more images (multi-select). Files go to the Supabase
            Storage bucket{" "}
            <code className="rounded bg-gray-100 px-1 text-xs">
              course_images
            </code>{" "}
            (linked in{" "}
            <code className="rounded bg-gray-100 px-1 text-xs">
              course_images.file_path
            </code>
            ), or paste an external image URL. Mark one image as primary for
            listings.
          </p>
        }
      />
    </div>
  );
}

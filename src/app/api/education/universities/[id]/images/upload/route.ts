import { randomUUID } from "crypto";
import { NextResponse } from "next/server";
import { createEducationUniversityImageUseCase } from "@/application/education";
import type { UniversityImageRow } from "@/domain/education";
import { EducationAccessError } from "@/domain/education";
import { EDUCATION_UNIVERSITY_IMAGES_BUCKET } from "@/infrastructure/supabase/education/education.constants";
import { requireEducationAdmin } from "@/infrastructure/supabase/education/education-admin";
import { createSupabaseServerClient } from "@/infrastructure/supabase/server-client";

/** Node runtime: Edge can lack stable `Buffer` / `File` for multipart uploads. */
export const runtime = "nodejs";

function mapDatabaseError(error: unknown): string {
  const maybe = error as { code?: string; message?: string };
  return maybe?.message ?? "Upload failed.";
}

export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const supabase = await createSupabaseServerClient();
    await requireEducationAdmin(supabase);
    const { id: universityId } = await params;

    const formData = await request.formData();
    const rawFiles = formData.getAll("file");
    const blobs: Blob[] = [];
    for (const v of rawFiles) {
      if (v instanceof Blob && v.size > 0) blobs.push(v);
    }
    if (blobs.length === 0) {
      return NextResponse.json(
        { error: "Expected at least one non-empty file." },
        { status: 400 }
      );
    }

    const rows: UniversityImageRow[] = [];

    for (const file of blobs) {
      const uploadId = randomUUID();
      const rawName =
        file instanceof File && typeof file.name === "string"
          ? file.name
          : "image";
      const safeName = rawName.replace(/[^a-zA-Z0-9._-]/g, "_") || "image";
      const objectPath = `${universityId}/${uploadId}/${safeName}`;
      const buffer = Buffer.from(await file.arrayBuffer());

      const { error: uploadError } = await supabase.storage
        .from(EDUCATION_UNIVERSITY_IMAGES_BUCKET)
        .upload(objectPath, buffer, {
          contentType: file.type || "application/octet-stream",
          upsert: false,
        });

      if (uploadError) {
        return NextResponse.json(
          { error: uploadError.message },
          { status: 400 }
        );
      }

      const row = await createEducationUniversityImageUseCase(
        universityId,
        objectPath
      );
      rows.push(row);
    }

    return NextResponse.json({ ok: true, rows, row: rows[0] }, { status: 201 });
  } catch (error) {
    if (error instanceof EducationAccessError) {
      return NextResponse.json({ error: error.message }, { status: 403 });
    }
    return NextResponse.json(
      { error: mapDatabaseError(error) },
      { status: 400 }
    );
  }
}

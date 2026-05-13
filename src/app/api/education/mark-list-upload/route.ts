import { randomUUID } from "crypto";
import { NextResponse } from "next/server";
import { EducationAccessError } from "@/domain/education";
import { insertMarkListUploadRow } from "@/infrastructure/supabase/education/education.repository";
import { requireEducationAdmin } from "@/infrastructure/supabase/education/education-admin";
import { EDUCATION_MARK_LIST_BUCKET } from "@/infrastructure/supabase/education/education.constants";
import { createSupabaseServerClient } from "@/infrastructure/supabase/server-client";

export async function POST(request: Request) {
  try {
    const supabase = await createSupabaseServerClient();
    const { userId } = await requireEducationAdmin(supabase);

    const formData = await request.formData();
    const file = formData.get("file");
    const studentId = formData.get("studentId");

    if (!(file instanceof File) || typeof studentId !== "string" || !studentId) {
      return NextResponse.json(
        { error: "Expected studentId and file fields." },
        { status: 400 }
      );
    }

    const uploadId = randomUUID();
    const safeName = file.name.replace(/[^a-zA-Z0-9._-]/g, "_");
    const path = `${studentId}/${uploadId}/${safeName}`;
    const buffer = Buffer.from(await file.arrayBuffer());

    const { error: uploadError } = await supabase.storage
      .from(EDUCATION_MARK_LIST_BUCKET)
      .upload(path, buffer, {
        contentType: file.type || "application/octet-stream",
        upsert: false,
      });

    if (uploadError) {
      return NextResponse.json({ error: uploadError.message }, { status: 400 });
    }

    await insertMarkListUploadRow(supabase, {
      student_id: studentId,
      storage_object_path: path,
      original_filename: file.name,
      mime_type: file.type || null,
      uploaded_by: userId,
    });

    return NextResponse.json({ ok: true, path });
  } catch (error) {
    if (error instanceof EducationAccessError) {
      return NextResponse.json({ error: error.message }, { status: 403 });
    }
    throw error;
  }
}

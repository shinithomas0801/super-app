import { NextResponse } from "next/server";
import {
  createEducationCourseImageUseCase,
  deleteEducationCourseImageUseCase,
  setEducationCoursePrimaryImageUseCase,
} from "@/application/education";
import { EducationAccessError } from "@/domain/education";

function mapDatabaseError(error: unknown): string {
  const maybe = error as { code?: string; message?: string };
  return maybe?.message ?? "Image operation failed.";
}

export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: courseId } = await params;
    const body = (await request.json()) as { file_path?: string };
    const file_path =
      typeof body.file_path === "string" ? body.file_path.trim() : "";
    if (!file_path) {
      return NextResponse.json(
        { error: "file_path is required (URL or storage path)." },
        { status: 400 }
      );
    }
    const row = await createEducationCourseImageUseCase(courseId, file_path);
    return NextResponse.json({ ok: true, row }, { status: 201 });
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

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: courseId } = await params;
    const body = (await request.json()) as { primary_image_id?: string };
    const primary_image_id =
      typeof body.primary_image_id === "string"
        ? body.primary_image_id.trim()
        : "";
    if (!primary_image_id) {
      return NextResponse.json(
        { error: "primary_image_id is required." },
        { status: 400 }
      );
    }
    await setEducationCoursePrimaryImageUseCase(courseId, primary_image_id);
    return NextResponse.json({ ok: true });
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

export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: courseId } = await params;
    const imageId = new URL(request.url).searchParams.get("image_id")?.trim();
    if (!imageId) {
      return NextResponse.json(
        { error: "Query image_id is required." },
        { status: 400 }
      );
    }
    await deleteEducationCourseImageUseCase(courseId, imageId);
    return NextResponse.json({ ok: true });
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

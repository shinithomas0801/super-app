import { NextResponse } from "next/server";
import {
  deleteEducationScholarshipUseCase,
  updateEducationScholarshipUseCase,
} from "@/application/education";
import type { UpdateScholarshipInput } from "@/domain/education";
import { EducationAccessError } from "@/domain/education";

type Payload = {
  university_id?: string;
  course_id?: string | null;
  name?: string;
  amount?: number | string | null;
  eligibility?: string | null;
  deadline?: string | null;
};

function buildPatch(body: Payload): UpdateScholarshipInput | { error: string } {
  const patch: UpdateScholarshipInput = {};
  if (typeof body.university_id === "string") {
    patch.university_id = body.university_id.trim();
  }
  if (typeof body.name === "string") {
    patch.name = body.name.trim();
  }
  if ("course_id" in body) patch.course_id = body.course_id ?? null;
  if ("amount" in body) patch.amount = body.amount ?? null;
  if ("eligibility" in body) patch.eligibility = body.eligibility ?? null;
  if ("deadline" in body) patch.deadline = body.deadline ?? null;
  if (Object.keys(patch).length === 0) {
    return { error: "No valid fields to update." };
  }
  return patch;
}

function mapDatabaseError(error: unknown): string {
  const maybe = error as { code?: string; message?: string };
  if (maybe?.code === "23503") {
    return "Invalid university_id or course_id (foreign key).";
  }
  return maybe?.message ?? "Scholarship mutation failed.";
}

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = (await request.json()) as Payload;
    const built = buildPatch(body);
    if ("error" in built) {
      return NextResponse.json({ error: built.error }, { status: 400 });
    }
    const row = await updateEducationScholarshipUseCase(id, built);
    return NextResponse.json({ ok: true, row });
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
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    await deleteEducationScholarshipUseCase(id);
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

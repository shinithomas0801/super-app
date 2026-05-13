import { NextResponse } from "next/server";
import {
  deleteEducationIntakeUseCase,
  updateEducationIntakeUseCase,
} from "@/application/education";
import type { UpdateIntakeInput } from "@/domain/education";
import { EducationAccessError } from "@/domain/education";

type Payload = {
  course_id?: string;
  name?: string;
  start_date?: string | null;
  application_deadline?: string | null;
  seats_available?: number | string | null;
};

function buildPatch(body: Payload): UpdateIntakeInput | { error: string } {
  const patch: UpdateIntakeInput = {};
  if (typeof body.course_id === "string") {
    patch.course_id = body.course_id.trim();
  }
  if (typeof body.name === "string") {
    patch.name = body.name.trim();
  }
  if ("start_date" in body) patch.start_date = body.start_date ?? null;
  if ("application_deadline" in body) {
    patch.application_deadline = body.application_deadline ?? null;
  }
  if ("seats_available" in body) patch.seats_available = body.seats_available;
  if (Object.keys(patch).length === 0) {
    return { error: "No valid fields to update." };
  }
  return patch;
}

function mapDatabaseError(error: unknown): string {
  const maybe = error as { code?: string; message?: string };
  if (maybe?.code === "23503") {
    return "Invalid course_id (foreign key).";
  }
  if (maybe?.code === "23505") {
    return "That update conflicts with an existing intake for this course.";
  }
  return maybe?.message ?? "Intake mutation failed.";
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
    const row = await updateEducationIntakeUseCase(id, built);
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
    await deleteEducationIntakeUseCase(id);
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

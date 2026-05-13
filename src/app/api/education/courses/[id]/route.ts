import { NextResponse } from "next/server";
import {
  deleteEducationCourseUseCase,
  updateEducationCourseUseCase,
} from "@/application/education";
import type { UpdateCourseInput } from "@/domain/education";
import { EducationAccessError } from "@/domain/education";

type Payload = {
  university_id?: string;
  name?: string;
  degree?: string | null;
  field_of_study?: string | null;
  duration_months?: number | string | null;
  tuition_fee?: number | string | null;
  currency?: string | null;
  min_qualification?: string | null;
};

function buildPatch(body: Payload): UpdateCourseInput | { error: string } {
  const patch: UpdateCourseInput = {};
  if (typeof body.university_id === "string") {
    patch.university_id = body.university_id.trim();
  }
  if (typeof body.name === "string") {
    patch.name = body.name.trim();
  }
  if ("degree" in body) patch.degree = body.degree ?? null;
  if ("field_of_study" in body) {
    patch.field_of_study = body.field_of_study ?? null;
  }
  if ("currency" in body) patch.currency = body.currency ?? null;
  if ("min_qualification" in body) {
    patch.min_qualification = body.min_qualification ?? null;
  }
  if ("duration_months" in body) {
    const v = body.duration_months;
    if (v === null || v === undefined || v === "") {
      patch.duration_months = null;
    } else {
      const n = typeof v === "number" ? v : Number(String(v).trim());
      if (!Number.isFinite(n) || n <= 0) {
        return {
          error: "duration_months must be a positive integer or empty.",
        };
      }
      patch.duration_months = Math.trunc(n);
    }
  }
  if ("tuition_fee" in body) {
    const v = body.tuition_fee;
    if (v === null || v === undefined || v === "") {
      patch.tuition_fee = null;
    } else {
      patch.tuition_fee = v;
    }
  }
  if (Object.keys(patch).length === 0) {
    return { error: "No valid fields to update." };
  }
  return patch;
}

function mapDatabaseError(error: unknown): string {
  const maybe = error as { code?: string; message?: string };
  if (maybe?.code === "23503") return "Invalid university_id (foreign key).";
  return maybe?.message ?? "Course mutation failed.";
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
    const row = await updateEducationCourseUseCase(id, built);
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
    await deleteEducationCourseUseCase(id);
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

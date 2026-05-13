import { NextResponse } from "next/server";
import { createEducationCourseUseCase } from "@/application/education";
import type { CreateCourseInput } from "@/domain/education";
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

function validateBody(
  body: Payload
): { error: string } | { value: CreateCourseInput } {
  const university_id = body.university_id?.trim();
  const name = body.name?.trim();
  if (!university_id || !name) {
    return { error: "university_id and name are required." };
  }
  let duration_months: number | null = null;
  if (body.duration_months != null && body.duration_months !== "") {
    const n =
      typeof body.duration_months === "number"
        ? body.duration_months
        : Number(String(body.duration_months).trim());
    if (Number.isFinite(n) && n > 0) duration_months = Math.trunc(n);
  }
  return {
    value: {
      university_id,
      name,
      degree: body.degree ?? null,
      field_of_study: body.field_of_study ?? null,
      duration_months,
      tuition_fee: body.tuition_fee ?? null,
      currency: body.currency ?? null,
      min_qualification: body.min_qualification ?? null,
    },
  };
}

function mapDatabaseError(error: unknown): string {
  const maybe = error as { code?: string; message?: string };
  if (maybe?.code === "23503") return "Invalid university_id (foreign key).";
  return maybe?.message ?? "Failed to create course.";
}

export async function POST(request: Request) {
  try {
    const body = (await request.json()) as Payload;
    const validated = validateBody(body);
    if ("error" in validated) {
      return NextResponse.json({ error: validated.error }, { status: 400 });
    }
    const row = await createEducationCourseUseCase(validated.value);
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

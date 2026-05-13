import { NextResponse } from "next/server";
import { createEducationIntakeUseCase } from "@/application/education";
import type { CreateIntakeInput } from "@/domain/education";
import { EducationAccessError } from "@/domain/education";

type Payload = {
  course_id?: string;
  name?: string;
  start_date?: string | null;
  application_deadline?: string | null;
  seats_available?: number | string | null;
};

function validateBody(
  body: Payload
): { error: string } | { value: CreateIntakeInput } {
  const course_id = body.course_id?.trim();
  const name = body.name?.trim();
  if (!course_id || !name) {
    return { error: "course_id and name are required." };
  }
  return {
    value: {
      course_id,
      name,
      start_date: body.start_date ?? null,
      application_deadline: body.application_deadline ?? null,
      seats_available: body.seats_available ?? null,
    },
  };
}

function mapDatabaseError(error: unknown): string {
  const maybe = error as { code?: string; message?: string };
  if (maybe?.code === "23503") {
    return "Invalid course_id (foreign key).";
  }
  if (maybe?.code === "23505") {
    return "An intake with this name and start date already exists for the course.";
  }
  return maybe?.message ?? "Failed to create intake.";
}

export async function POST(request: Request) {
  try {
    const body = (await request.json()) as Payload;
    const validated = validateBody(body);
    if ("error" in validated) {
      return NextResponse.json({ error: validated.error }, { status: 400 });
    }
    const row = await createEducationIntakeUseCase(validated.value);
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

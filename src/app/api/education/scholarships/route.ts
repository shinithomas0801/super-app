import { NextResponse } from "next/server";
import { createEducationScholarshipUseCase } from "@/application/education";
import type { CreateScholarshipInput } from "@/domain/education";
import { EducationAccessError } from "@/domain/education";

type Payload = {
  university_id?: string;
  course_id?: string | null;
  name?: string;
  amount?: number | string | null;
  eligibility?: string | null;
  deadline?: string | null;
};

function validateBody(
  body: Payload
): { error: string } | { value: CreateScholarshipInput } {
  const university_id = body.university_id?.trim();
  const name = body.name?.trim();
  if (!university_id || !name) {
    return { error: "university_id and name are required." };
  }
  return {
    value: {
      university_id,
      course_id: body.course_id ?? null,
      name,
      amount: body.amount ?? null,
      eligibility: body.eligibility ?? null,
      deadline: body.deadline ?? null,
    },
  };
}

function mapDatabaseError(error: unknown): string {
  const maybe = error as { code?: string; message?: string };
  if (maybe?.code === "23503") {
    return "Invalid university_id or course_id (foreign key).";
  }
  return maybe?.message ?? "Failed to create scholarship.";
}

export async function POST(request: Request) {
  try {
    const body = (await request.json()) as Payload;
    const validated = validateBody(body);
    if ("error" in validated) {
      return NextResponse.json({ error: validated.error }, { status: 400 });
    }
    const row = await createEducationScholarshipUseCase(validated.value);
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

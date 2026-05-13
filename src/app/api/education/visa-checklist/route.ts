import { NextResponse } from "next/server";
import { createEducationVisaChecklistItemUseCase } from "@/application/education";
import type { CreateVisaChecklistInput } from "@/domain/education";
import { EducationAccessError } from "@/domain/education";

type Payload = {
  country_id?: string;
  document_name?: string;
  description?: string | null;
  is_mandatory?: boolean;
};

function validateBody(
  body: Payload
): { error: string } | { value: CreateVisaChecklistInput } {
  const country_id = body.country_id?.trim();
  const document_name = body.document_name?.trim();
  if (!country_id || !document_name) {
    return { error: "country_id and document_name are required." };
  }
  const n = Number(country_id);
  if (!Number.isFinite(n)) {
    return { error: "country_id must be a valid country id." };
  }
  return {
    value: {
      country_id,
      document_name,
      description: body.description ?? null,
      is_mandatory: body.is_mandatory ?? true,
    },
  };
}

function mapDatabaseError(error: unknown): string {
  const maybe = error as { code?: string; message?: string };
  if (maybe?.code === "23503") {
    return "Invalid country_id (foreign key).";
  }
  return maybe?.message ?? "Failed to create visa checklist item.";
}

export async function POST(request: Request) {
  try {
    const body = (await request.json()) as Payload;
    const validated = validateBody(body);
    if ("error" in validated) {
      return NextResponse.json({ error: validated.error }, { status: 400 });
    }
    const row = await createEducationVisaChecklistItemUseCase(validated.value);
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

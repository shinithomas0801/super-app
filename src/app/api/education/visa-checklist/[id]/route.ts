import { NextResponse } from "next/server";
import {
  deleteEducationVisaChecklistItemUseCase,
  updateEducationVisaChecklistItemUseCase,
} from "@/application/education";
import type { UpdateVisaChecklistInput } from "@/domain/education";
import { EducationAccessError } from "@/domain/education";

type Payload = {
  country_id?: string;
  document_name?: string;
  description?: string | null;
  is_mandatory?: boolean;
};

function buildPatch(
  body: Payload
): UpdateVisaChecklistInput | { error: string } {
  const patch: UpdateVisaChecklistInput = {};
  if (typeof body.country_id === "string") {
    const t = body.country_id.trim();
    if (t && !Number.isFinite(Number(t))) {
      return { error: "country_id must be a valid country id." };
    }
    if (t) patch.country_id = t;
  }
  if (typeof body.document_name === "string") {
    patch.document_name = body.document_name.trim();
  }
  if ("description" in body) patch.description = body.description ?? null;
  if ("is_mandatory" in body) patch.is_mandatory = body.is_mandatory;
  if (Object.keys(patch).length === 0) {
    return { error: "No valid fields to update." };
  }
  return patch;
}

function mapDatabaseError(error: unknown): string {
  const maybe = error as { code?: string; message?: string };
  if (maybe?.code === "23503") {
    return "Invalid country_id (foreign key).";
  }
  return maybe?.message ?? "Visa checklist mutation failed.";
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
    const row = await updateEducationVisaChecklistItemUseCase(id, built);
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
    await deleteEducationVisaChecklistItemUseCase(id);
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

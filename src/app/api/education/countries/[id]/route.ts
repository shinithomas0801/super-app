import { NextResponse } from "next/server";
import {
  deleteEducationCountryUseCase,
  updateEducationCountryUseCase,
} from "@/application/education";
import { EducationAccessError } from "@/domain/education";

type Payload = {
  iso_code?: string;
  name?: string;
  sort_order?: number;
  active?: boolean;
};

function mapDatabaseError(error: unknown): string {
  const maybe = error as { code?: string; message?: string };
  if (maybe?.code === "23505") return "Country ISO code already exists.";
  return maybe?.message ?? "Country mutation failed.";
}

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = (await request.json()) as Payload;
    const row = await updateEducationCountryUseCase(id, {
      ...(typeof body.iso_code === "string"
        ? { iso_code: body.iso_code.trim().toUpperCase() }
        : {}),
      ...(typeof body.name === "string" ? { name: body.name.trim() } : {}),
      ...(typeof body.sort_order === "number"
        ? { sort_order: Math.trunc(body.sort_order) }
        : {}),
      ...(typeof body.active === "boolean" ? { active: body.active } : {}),
    });
    return NextResponse.json({ ok: true, row });
  } catch (error) {
    if (error instanceof EducationAccessError) {
      return NextResponse.json({ error: error.message }, { status: 403 });
    }
    return NextResponse.json({ error: mapDatabaseError(error) }, { status: 400 });
  }
}

export async function DELETE(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    await deleteEducationCountryUseCase(id);
    return NextResponse.json({ ok: true });
  } catch (error) {
    if (error instanceof EducationAccessError) {
      return NextResponse.json({ error: error.message }, { status: 403 });
    }
    return NextResponse.json({ error: mapDatabaseError(error) }, { status: 400 });
  }
}

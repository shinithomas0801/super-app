import { NextResponse } from "next/server";
import { createEducationCountryUseCase } from "@/application/education";
import { EducationAccessError } from "@/domain/education";

type Payload = {
  iso_code?: string;
  name?: string;
  active?: boolean;
};

function mapDatabaseError(error: unknown): string {
  const maybe = error as { code?: string; message?: string };
  if (maybe?.code === "23505") return "Country ISO code already exists.";
  return maybe?.message ?? "Failed to create country.";
}

export async function POST(request: Request) {
  try {
    const body = (await request.json()) as Payload;
    const iso = body.iso_code?.trim().toUpperCase();
    const name = body.name?.trim();

    if (!iso || !name || iso.length !== 2) {
      return NextResponse.json(
        { error: "iso_code (2 letters) and name are required." },
        { status: 400 }
      );
    }

    const row = await createEducationCountryUseCase({
      iso_code: iso,
      name,
      active: body.active ?? true,
    });

    return NextResponse.json({ ok: true, row }, { status: 201 });
  } catch (error) {
    if (error instanceof EducationAccessError) {
      return NextResponse.json({ error: error.message }, { status: 403 });
    }
    return NextResponse.json({ error: mapDatabaseError(error) }, { status: 400 });
  }
}

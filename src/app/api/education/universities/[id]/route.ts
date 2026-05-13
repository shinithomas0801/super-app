import { NextResponse } from "next/server";
import {
  deleteEducationUniversityUseCase,
  getEducationUniversityDetailUseCase,
  updateEducationUniversityUseCase,
} from "@/application/education";
import type { UpdateUniversityInput } from "@/domain/education";
import { EducationAccessError } from "@/domain/education";

type Payload = {
  country_id?: string;
  name?: string;
  city?: string | null;
  website_url?: string | null;
  ranking?: number | string | null;
};

function parseRanking(
  value: unknown
): { ok: true; value: number | null } | { ok: false; error: string } {
  if (value === undefined || value === null || value === "") {
    return { ok: true, value: null };
  }
  const n = typeof value === "number" ? value : Number(String(value).trim());
  if (!Number.isFinite(n)) {
    return { ok: false, error: "ranking must be a finite number." };
  }
  return { ok: true, value: Math.trunc(n) };
}

function mapDatabaseError(error: unknown): string {
  const maybe = error as { code?: string; message?: string };
  if (maybe?.code === "23505")
    return "That record conflicts with an existing row.";
  return maybe?.message ?? "University mutation failed.";
}

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const result = await getEducationUniversityDetailUseCase(id);
    if (!result.found) {
      return NextResponse.json(
        { error: "University not found." },
        { status: 404 }
      );
    }
    return NextResponse.json({ ok: true, ...result.detail });
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

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = (await request.json()) as Payload;
    const patch: UpdateUniversityInput = {};
    if (typeof body.country_id === "string")
      patch.country_id = body.country_id.trim();
    if (typeof body.name === "string") patch.name = body.name.trim();
    if ("city" in body) {
      const raw = body.city;
      patch.city =
        raw == null || String(raw).trim() === "" ? null : String(raw).trim();
    }
    if ("website_url" in body) patch.website_url = body.website_url ?? null;
    if ("ranking" in body) {
      const parsed = parseRanking(body.ranking);
      if (!parsed.ok) {
        return NextResponse.json({ error: parsed.error }, { status: 400 });
      }
      patch.ranking = parsed.value;
    }

    const row = await updateEducationUniversityUseCase(id, patch);
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
    await deleteEducationUniversityUseCase(id);
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

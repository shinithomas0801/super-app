import { NextResponse } from "next/server";
import { createEducationUniversityUseCase } from "@/application/education";
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

function validateBody(body: Payload) {
  const country_id = body.country_id?.trim();
  const name = body.name?.trim();
  if (!country_id || !name) {
    return { error: "country_id and name are required." };
  }
  if (body.website_url && !/^https?:\/\//.test(body.website_url)) {
    return { error: "website_url must start with http:// or https://." };
  }
  const rankingParsed = parseRanking(body.ranking);
  if (!rankingParsed.ok) {
    return { error: rankingParsed.error };
  }
  const cityRaw = body.city;
  const city =
    cityRaw == null || String(cityRaw).trim() === ""
      ? null
      : String(cityRaw).trim();
  return {
    value: {
      country_id,
      name,
      city,
      website_url: body.website_url ?? null,
      ranking: rankingParsed.value,
    },
  };
}

function mapDatabaseError(error: unknown): string {
  const maybe = error as { code?: string; message?: string };
  if (maybe?.code === "23505")
    return "That record conflicts with an existing row.";
  return maybe?.message ?? "Failed to create university.";
}

export async function POST(request: Request) {
  try {
    const body = (await request.json()) as Payload;
    const validated = validateBody(body);
    if ("error" in validated) {
      return NextResponse.json({ error: validated.error }, { status: 400 });
    }
    const row = await createEducationUniversityUseCase(validated.value);
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

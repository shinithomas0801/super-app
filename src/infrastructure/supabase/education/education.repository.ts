import type { SupabaseClient } from "@supabase/supabase-js";
import {
  EDUCATION_ENDPOINTS,
  EDUCATION_MARK_LIST_BUCKET,
  EDUCATION_SELECTS,
} from "./education.constants";
import type {
  AiRunSummary,
  ApplicationRow,
  CostBenchmarkRow,
  CreateCountryInput,
  CourseImageRow,
  CreateCourseInput,
  UpdateCourseInput,
  CreateUniversityInput,
  CountryRow,
  CourseRow,
  EducationDashboardCounts,
  EligibilityRulesetRow,
  ExamScoreRow,
  CreateIntakeInput,
  IntakeRow,
  UpdateIntakeInput,
  MarkListUploadRow,
  CreateScholarshipInput,
  CreateVisaChecklistInput,
  ScholarshipRow,
  StudentProfileRow,
  UpdateScholarshipInput,
  UpdateVisaChecklistInput,
  UpdateUniversityInput,
  UniversityImageRow,
  UniversityRow,
  VisaChecklistRow,
} from "@/domain/education";

const ENDPOINTS = EDUCATION_ENDPOINTS;
const SELECTS = EDUCATION_SELECTS;

function educationModule(client: SupabaseClient) {
  return client.schema("education_module");
}

async function countExact(
  client: Pick<SupabaseClient, "from">,
  table: string,
  filter?: { column: string; value: string }
): Promise<number> {
  let q = client.from(table).select("*", { count: "exact", head: true });
  if (filter) q = q.eq(filter.column, filter.value);
  const { count, error } = await q;
  if (error) throw error;
  return count ?? 0;
}

export async function fetchEducationDashboardCounts(
  client: SupabaseClient
): Promise<EducationDashboardCounts> {
  const [countries, universities, courses, students, scholarships] =
    await Promise.all([
      countExact(client, ENDPOINTS.countries),
      countExact(educationModule(client), ENDPOINTS.universities),
      countExact(educationModule(client), ENDPOINTS.courses),
      countExact(client, ENDPOINTS.studentProfiles),
      countExact(educationModule(client), ENDPOINTS.scholarships),
    ]);

  return {
    countries,
    universities,
    courses,
    students,
    scholarships,
    markUploadsPending: 0,
  };
}

export async function fetchAiRunSummary(
  client: SupabaseClient
): Promise<AiRunSummary> {
  void client;
  return {
    eligibilityRuns: 0,
    recommendationRuns: 0,
    documentAnalyses: 0,
    chatSessions: 0,
  };
}

type CountryDbRow = {
  id: number;
  name: string;
  iso_code: string | null;
};

function mapCountryListRow(row: CountryDbRow, idx: number): CountryRow {
  return {
    id: String(row.id),
    iso_code: row.iso_code ? String(row.iso_code).toUpperCase() : "",
    name: row.name,
    active: true,
    sort_order: (idx + 1) * 10,
  };
}

export async function listCountries(
  client: SupabaseClient,
  limit = 500
): Promise<CountryRow[]> {
  const { data, error } = await client
    .from(ENDPOINTS.countries)
    .select(SELECTS.countries)
    .order("name")
    .limit(limit);
  if (error) throw error;
  return (data ?? []).map((row, idx) =>
    mapCountryListRow(row as CountryDbRow, idx)
  );
}

export async function listCountriesForAdmin(
  client: SupabaseClient,
  limit = 1000
): Promise<CountryRow[]> {
  const { data, error } = await client
    .from(ENDPOINTS.countries)
    .select(SELECTS.countries)
    .order("name")
    .limit(limit);
  if (error) throw error;
  return (data ?? []).map((row, idx) =>
    mapCountryListRow(row as CountryDbRow, idx)
  );
}

export async function createCountry(
  client: SupabaseClient,
  payload: CreateCountryInput
): Promise<CountryRow> {
  const { count, error: countError } = await client
    .from(ENDPOINTS.countries)
    .select("*", { count: "exact", head: true });
  if (countError) throw countError;

  const iso = String(payload.iso_code).trim().toUpperCase();
  const { data, error } = await client
    .from(ENDPOINTS.countries)
    .insert({
      name: payload.name.trim(),
      currency: "UNKNOWN",
      iso_code: iso,
    })
    .select(SELECTS.countries)
    .single();
  if (error) throw error;
  const row = data as CountryDbRow;
  return {
    id: String(row.id),
    iso_code: row.iso_code ? String(row.iso_code).toUpperCase() : iso,
    name: row.name,
    active: payload.active ?? true,
    sort_order: ((count ?? 0) + 1) * 10,
  };
}

export async function updateCountry(
  client: SupabaseClient,
  id: string,
  payload: Partial<CreateCountryInput> & { sort_order?: number }
): Promise<CountryRow> {
  const updates: Record<string, unknown> = {};
  if (payload.name !== undefined) {
    updates.name = String(payload.name).trim();
  }
  if (payload.iso_code !== undefined) {
    updates.iso_code = String(payload.iso_code).trim().toUpperCase();
  }
  if (Object.keys(updates).length === 0) {
    const { data, error } = await client
      .from(ENDPOINTS.countries)
      .select(SELECTS.countries)
      .eq("id", id)
      .maybeSingle();
    if (error) throw error;
    if (!data) throw new Error("Country not found.");
    const row = data as CountryDbRow;
    return {
      id: String(row.id),
      iso_code: row.iso_code ? String(row.iso_code).toUpperCase() : "",
      name: row.name,
      active: payload.active ?? true,
      sort_order: payload.sort_order ?? 0,
    };
  }
  const { data, error } = await client
    .from(ENDPOINTS.countries)
    .update(updates)
    .eq("id", id)
    .select(SELECTS.countries)
    .single();
  if (error) throw error;
  const row = data as CountryDbRow;
  return {
    id: String(row.id),
    iso_code: row.iso_code ? String(row.iso_code).toUpperCase() : "",
    name: row.name,
    active: payload.active ?? true,
    sort_order: payload.sort_order ?? 0,
  };
}

export async function deleteCountry(
  client: SupabaseClient,
  id: string
): Promise<void> {
  const { error } = await client
    .from(ENDPOINTS.countries)
    .delete()
    .eq("id", id);
  if (error) throw error;
}

export async function listUniversities(
  client: SupabaseClient,
  limit = 100
): Promise<UniversityRow[]> {
  const { data, error } = await educationModule(client)
    .from(ENDPOINTS.universities)
    .select(SELECTS.universities)
    .order("name")
    .limit(limit);
  if (error) throw error;
  return (data ?? []).map((row: Parameters<typeof mapUniversityRow>[0]) =>
    mapUniversityRow(row)
  );
}

function mapUniversityRow(row: {
  id: string;
  country_id: number;
  name: string;
  city: string | null;
  website: string | null;
  ranking: number | null;
}): UniversityRow {
  return {
    id: row.id,
    country_id: String(row.country_id),
    name: row.name,
    city: row.city ?? null,
    website_url: row.website,
    ranking: row.ranking ?? null,
  };
}

export async function getUniversityById(
  client: SupabaseClient,
  id: string
): Promise<UniversityRow | null> {
  const { data, error } = await educationModule(client)
    .from(ENDPOINTS.universities)
    .select(SELECTS.universities)
    .eq("id", id)
    .maybeSingle();
  if (error) throw error;
  if (!data) return null;
  return mapUniversityRow(
    data as {
      id: string;
      country_id: number;
      name: string;
      city: string | null;
      website: string | null;
      ranking: number | null;
    }
  );
}

export async function listUniversityImages(
  client: SupabaseClient,
  universityId: string
): Promise<UniversityImageRow[]> {
  const { data, error } = await educationModule(client)
    .from(ENDPOINTS.universityImages)
    .select(SELECTS.universityImages)
    .eq("university_id", universityId)
    .order("id");
  if (error) throw error;
  return (data ?? []).map(
    (row: {
      id: string;
      university_id: string;
      file_path: string;
      is_primary: boolean;
    }) => ({
      id: row.id,
      university_id: row.university_id,
      file_path: row.file_path,
      is_primary: row.is_primary,
    })
  );
}

export async function insertUniversityImage(
  client: SupabaseClient,
  universityId: string,
  filePath: string
): Promise<UniversityImageRow> {
  const { data, error } = await educationModule(client)
    .from(ENDPOINTS.universityImages)
    .insert({
      university_id: universityId,
      file_path: filePath,
      is_primary: false,
    })
    .select(SELECTS.universityImages)
    .single();
  if (error) throw error;
  const row = data as {
    id: string;
    university_id: string;
    file_path: string;
    is_primary: boolean;
  };
  return {
    id: row.id,
    university_id: row.university_id,
    file_path: row.file_path,
    is_primary: row.is_primary,
  };
}

export async function setUniversityPrimaryImage(
  client: SupabaseClient,
  universityId: string,
  imageId: string
): Promise<void> {
  const { error: clearError } = await educationModule(client)
    .from(ENDPOINTS.universityImages)
    .update({ is_primary: false })
    .eq("university_id", universityId);
  if (clearError) throw clearError;
  const { error: setError } = await educationModule(client)
    .from(ENDPOINTS.universityImages)
    .update({ is_primary: true })
    .eq("id", imageId)
    .eq("university_id", universityId);
  if (setError) throw setError;
}

/** Deletes the row and returns `file_path` for storage cleanup (or null if no row). */
export async function deleteUniversityImage(
  client: SupabaseClient,
  universityId: string,
  imageId: string
): Promise<string | null> {
  const { data: row, error: fetchError } = await educationModule(client)
    .from(ENDPOINTS.universityImages)
    .select("file_path")
    .eq("id", imageId)
    .eq("university_id", universityId)
    .maybeSingle();
  if (fetchError) throw fetchError;
  if (!row) return null;
  const file_path = (row as { file_path: string }).file_path;
  const { error } = await educationModule(client)
    .from(ENDPOINTS.universityImages)
    .delete()
    .eq("id", imageId)
    .eq("university_id", universityId);
  if (error) throw error;
  return file_path;
}

function normalizeUniversityPayload(
  payload: CreateUniversityInput | UpdateUniversityInput
) {
  const out: Record<string, unknown> = {};
  if ("country_id" in payload) out.country_id = Number(payload.country_id);
  if ("name" in payload) out.name = payload.name;
  if ("city" in payload) {
    const raw = payload.city;
    out.city =
      raw == null || String(raw).trim() === "" ? null : String(raw).trim();
  }
  if ("website_url" in payload) out.website = payload.website_url ?? null;
  if ("ranking" in payload) {
    const v = payload.ranking;
    if (v == null) out.ranking = null;
    else {
      const n = Number(v);
      out.ranking = Number.isFinite(n) ? Math.trunc(n) : null;
    }
  }
  return out;
}

export async function createUniversity(
  client: SupabaseClient,
  payload: CreateUniversityInput
): Promise<UniversityRow> {
  const { data, error } = await educationModule(client)
    .from(ENDPOINTS.universities)
    .insert(normalizeUniversityPayload(payload))
    .select(SELECTS.universities)
    .single();
  if (error) throw error;
  return mapUniversityRow(
    data as {
      id: string;
      country_id: number;
      name: string;
      city: string | null;
      website: string | null;
      ranking: number | null;
    }
  );
}

export async function updateUniversity(
  client: SupabaseClient,
  id: string,
  patch: UpdateUniversityInput
): Promise<UniversityRow> {
  const { data, error } = await educationModule(client)
    .from(ENDPOINTS.universities)
    .update(normalizeUniversityPayload(patch))
    .eq("id", id)
    .select(SELECTS.universities)
    .single();
  if (error) throw error;
  return mapUniversityRow(
    data as {
      id: string;
      country_id: number;
      name: string;
      city: string | null;
      website: string | null;
      ranking: number | null;
    }
  );
}

export async function deleteUniversity(
  client: SupabaseClient,
  id: string
): Promise<void> {
  const { error } = await educationModule(client)
    .from(ENDPOINTS.universities)
    .delete()
    .eq("id", id);
  if (error) throw error;
}

type CourseDbRow = {
  id: string;
  university_id: string;
  name: string;
  degree: string | null;
  min_qualification: string | null;
  duration_months: number | null;
  tuition_fee: string | number | null;
  currency: string | null;
  field_of_study: string | null;
  university?: { name: string } | { name: string }[] | null;
};

function mapCourseRow(row: CourseDbRow): CourseRow {
  const tuition =
    row.tuition_fee != null && row.tuition_fee !== ""
      ? String(row.tuition_fee)
      : null;
  let university_name: string | undefined;
  if (row.university) {
    const u = Array.isArray(row.university)
      ? row.university[0]
      : row.university;
    if (u && typeof u.name === "string") university_name = u.name;
  }
  return {
    id: row.id,
    university_id: row.university_id,
    university_name,
    name: row.name,
    degree: row.degree,
    field_of_study: row.field_of_study,
    duration_months: row.duration_months,
    tuition_fee: tuition,
    currency: row.currency,
    min_qualification: row.min_qualification,
  };
}

export async function listCourses(
  client: SupabaseClient,
  limit = 100
): Promise<CourseRow[]> {
  const { data, error } = await educationModule(client)
    .from(ENDPOINTS.courses)
    .select(SELECTS.coursesWithUniversity)
    .order("name")
    .limit(limit);
  if (error) throw error;
  return (data ?? []).map((row) => mapCourseRow(row as CourseDbRow));
}

export async function getCourseById(
  client: SupabaseClient,
  id: string
): Promise<CourseRow | null> {
  const { data, error } = await educationModule(client)
    .from(ENDPOINTS.courses)
    .select(SELECTS.courses)
    .eq("id", id)
    .maybeSingle();
  if (error) throw error;
  if (!data) return null;
  return mapCourseRow(data as CourseDbRow);
}

function normalizeCourseInsert(payload: CreateCourseInput) {
  const name = String(payload.name).trim();
  const university_id = String(payload.university_id).trim();
  const trimOrNull = (v: unknown) => {
    if (v == null) return null;
    const s = String(v).trim();
    return s === "" ? null : s;
  };
  let duration_months: number | null = null;
  if (payload.duration_months != null) {
    const n = Number(payload.duration_months);
    if (Number.isFinite(n) && n > 0) duration_months = Math.trunc(n);
  }
  let tuition_fee: number | null = null;
  if (payload.tuition_fee != null && payload.tuition_fee !== "") {
    const n =
      typeof payload.tuition_fee === "number"
        ? payload.tuition_fee
        : Number(String(payload.tuition_fee).trim());
    if (Number.isFinite(n)) tuition_fee = n;
  }
  return {
    university_id,
    name,
    degree: trimOrNull(payload.degree),
    field_of_study: trimOrNull(payload.field_of_study),
    duration_months,
    tuition_fee,
    currency: trimOrNull(payload.currency),
    min_qualification: trimOrNull(payload.min_qualification),
  };
}

export async function createCourse(
  client: SupabaseClient,
  payload: CreateCourseInput
): Promise<CourseRow> {
  const { data, error } = await educationModule(client)
    .from(ENDPOINTS.courses)
    .insert(normalizeCourseInsert(payload))
    .select(SELECTS.courses)
    .single();
  if (error) throw error;
  return mapCourseRow(data as CourseDbRow);
}

function normalizeCourseUpdate(
  patch: UpdateCourseInput
): Record<string, unknown> {
  const out: Record<string, unknown> = {};
  const trimOrNull = (v: unknown) => {
    if (v == null) return null;
    const s = String(v).trim();
    return s === "" ? null : s;
  };
  if (patch.university_id !== undefined) {
    out.university_id = String(patch.university_id).trim();
  }
  if (patch.name !== undefined) {
    out.name = String(patch.name).trim();
  }
  if (patch.degree !== undefined) out.degree = trimOrNull(patch.degree);
  if (patch.field_of_study !== undefined) {
    out.field_of_study = trimOrNull(patch.field_of_study);
  }
  if (patch.currency !== undefined) out.currency = trimOrNull(patch.currency);
  if (patch.min_qualification !== undefined) {
    out.min_qualification = trimOrNull(patch.min_qualification);
  }
  if (patch.duration_months !== undefined) {
    if (patch.duration_months === null) {
      out.duration_months = null;
    } else {
      const n = Number(patch.duration_months);
      out.duration_months = Number.isFinite(n) && n > 0 ? Math.trunc(n) : null;
    }
  }
  if (patch.tuition_fee !== undefined) {
    if (patch.tuition_fee === null || patch.tuition_fee === "") {
      out.tuition_fee = null;
    } else {
      const n =
        typeof patch.tuition_fee === "number"
          ? patch.tuition_fee
          : Number(String(patch.tuition_fee).trim());
      out.tuition_fee = Number.isFinite(n) ? n : null;
    }
  }
  return out;
}

export async function updateCourse(
  client: SupabaseClient,
  id: string,
  patch: UpdateCourseInput
): Promise<CourseRow> {
  const normalized = normalizeCourseUpdate(patch);
  if (Object.keys(normalized).length === 0) {
    const existing = await getCourseById(client, id);
    if (!existing) throw new Error("Course not found.");
    return existing;
  }
  const { data, error } = await educationModule(client)
    .from(ENDPOINTS.courses)
    .update(normalized)
    .eq("id", id)
    .select(SELECTS.courses)
    .single();
  if (error) throw error;
  return mapCourseRow(data as CourseDbRow);
}

export async function deleteCourse(
  client: SupabaseClient,
  id: string
): Promise<void> {
  const { error } = await educationModule(client)
    .from(ENDPOINTS.courses)
    .delete()
    .eq("id", id);
  if (error) throw error;
}

export async function listCourseImages(
  client: SupabaseClient,
  courseId: string
): Promise<CourseImageRow[]> {
  const { data, error } = await educationModule(client)
    .from(ENDPOINTS.courseImages)
    .select(SELECTS.courseImages)
    .eq("course_id", courseId)
    .order("id");
  if (error) throw error;
  return (data ?? []).map(
    (row: {
      id: string;
      course_id: string;
      file_path: string;
      is_primary: boolean;
    }) => ({
      id: row.id,
      course_id: row.course_id,
      file_path: row.file_path,
      is_primary: row.is_primary,
    })
  );
}

export async function insertCourseImage(
  client: SupabaseClient,
  courseId: string,
  filePath: string
): Promise<CourseImageRow> {
  const { data, error } = await educationModule(client)
    .from(ENDPOINTS.courseImages)
    .insert({
      course_id: courseId,
      file_path: filePath,
      is_primary: false,
    })
    .select(SELECTS.courseImages)
    .single();
  if (error) throw error;
  const row = data as {
    id: string;
    course_id: string;
    file_path: string;
    is_primary: boolean;
  };
  return {
    id: row.id,
    course_id: row.course_id,
    file_path: row.file_path,
    is_primary: row.is_primary,
  };
}

export async function setCoursePrimaryImage(
  client: SupabaseClient,
  courseId: string,
  imageId: string
): Promise<void> {
  const { error: clearError } = await educationModule(client)
    .from(ENDPOINTS.courseImages)
    .update({ is_primary: false })
    .eq("course_id", courseId);
  if (clearError) throw clearError;
  const { error: setError } = await educationModule(client)
    .from(ENDPOINTS.courseImages)
    .update({ is_primary: true })
    .eq("id", imageId)
    .eq("course_id", courseId);
  if (setError) throw setError;
}

export async function deleteCourseImage(
  client: SupabaseClient,
  courseId: string,
  imageId: string
): Promise<string | null> {
  const { data: row, error: fetchError } = await educationModule(client)
    .from(ENDPOINTS.courseImages)
    .select("file_path")
    .eq("id", imageId)
    .eq("course_id", courseId)
    .maybeSingle();
  if (fetchError) throw fetchError;
  if (!row) return null;
  const file_path = (row as { file_path: string }).file_path;
  const { error } = await educationModule(client)
    .from(ENDPOINTS.courseImages)
    .delete()
    .eq("id", imageId)
    .eq("course_id", courseId);
  if (error) throw error;
  return file_path;
}

type IntakeDbRow = {
  id: string;
  course_id: string;
  name: string;
  start_date: string | null;
  application_deadline: string | null;
  seats_available: number | null;
  course?: { name: string } | { name: string }[] | null;
};

function mapIntakeRow(row: IntakeDbRow): IntakeRow {
  return {
    id: row.id,
    course_id: row.course_id,
    course_name: embeddedName(row.course),
    name: row.name,
    start_date: row.start_date,
    application_deadline: row.application_deadline,
    seats_available: row.seats_available,
  };
}

function sliceDateOrNull(v: unknown): string | null {
  if (v == null || String(v).trim() === "") return null;
  return String(v).trim().slice(0, 10);
}

function normalizeIntakeInsert(payload: CreateIntakeInput) {
  const name = String(payload.name).trim();
  const course_id = String(payload.course_id).trim();
  let seats_available: number | null = null;
  if (payload.seats_available != null && payload.seats_available !== "") {
    const n = Number(payload.seats_available);
    if (Number.isFinite(n) && n >= 0) seats_available = Math.trunc(n);
  }
  return {
    course_id,
    name,
    start_date: sliceDateOrNull(payload.start_date),
    application_deadline: sliceDateOrNull(payload.application_deadline),
    seats_available,
  };
}

function normalizeIntakeUpdate(
  patch: UpdateIntakeInput
): Record<string, unknown> {
  const out: Record<string, unknown> = {};
  if (patch.course_id !== undefined) {
    out.course_id = String(patch.course_id).trim();
  }
  if (patch.name !== undefined) {
    out.name = String(patch.name).trim();
  }
  if (patch.start_date !== undefined) {
    out.start_date = sliceDateOrNull(patch.start_date);
  }
  if (patch.application_deadline !== undefined) {
    out.application_deadline = sliceDateOrNull(patch.application_deadline);
  }
  if (patch.seats_available !== undefined) {
    if (patch.seats_available === null || patch.seats_available === "") {
      out.seats_available = null;
    } else {
      const n = Number(patch.seats_available);
      out.seats_available = Number.isFinite(n) && n >= 0 ? Math.trunc(n) : null;
    }
  }
  return out;
}

export async function listIntakes(
  client: SupabaseClient,
  limit = 100
): Promise<IntakeRow[]> {
  const { data, error } = await educationModule(client)
    .from(ENDPOINTS.intakes)
    .select(SELECTS.intakes)
    .order("start_date", { ascending: false, nullsFirst: true })
    .limit(limit);
  if (error) throw error;
  return (data ?? []).map((row) => mapIntakeRow(row as IntakeDbRow));
}

export async function createIntake(
  client: SupabaseClient,
  payload: CreateIntakeInput
): Promise<IntakeRow> {
  const { data, error } = await educationModule(client)
    .from(ENDPOINTS.intakes)
    .insert(normalizeIntakeInsert(payload))
    .select(SELECTS.intakes)
    .single();
  if (error) throw error;
  return mapIntakeRow(data as IntakeDbRow);
}

export async function updateIntake(
  client: SupabaseClient,
  id: string,
  patch: UpdateIntakeInput
): Promise<IntakeRow> {
  const normalized = normalizeIntakeUpdate(patch);
  if (Object.keys(normalized).length === 0) {
    const { data, error } = await educationModule(client)
      .from(ENDPOINTS.intakes)
      .select(SELECTS.intakes)
      .eq("id", id)
      .maybeSingle();
    if (error) throw error;
    if (!data) throw new Error("Intake not found.");
    return mapIntakeRow(data as IntakeDbRow);
  }
  const { data, error } = await educationModule(client)
    .from(ENDPOINTS.intakes)
    .update(normalized)
    .eq("id", id)
    .select(SELECTS.intakes)
    .single();
  if (error) throw error;
  return mapIntakeRow(data as IntakeDbRow);
}

export async function deleteIntake(
  client: SupabaseClient,
  id: string
): Promise<void> {
  const { error } = await educationModule(client)
    .from(ENDPOINTS.intakes)
    .delete()
    .eq("id", id);
  if (error) throw error;
}

export async function listStudentProfiles(
  client: SupabaseClient,
  limit = 100
): Promise<StudentProfileRow[]> {
  const { data, error } = await client
    .from(ENDPOINTS.studentProfiles)
    .select(SELECTS.studentProfiles)
    .order("created_at", { ascending: false })
    .limit(limit);
  if (error) throw error;
  return (data ?? []).map((row: { id: string; full_name: string | null }) => ({
    id: row.id,
    full_name: row.full_name ?? "Unknown",
    email: null,
    nationality_country_id: null,
    external_student_ref: null,
  }));
}

export async function listMarkListUploads(
  client: SupabaseClient,
  limit = 100
): Promise<MarkListUploadRow[]> {
  void client;
  void limit;
  return [];
}

export async function listExamScores(
  client: SupabaseClient,
  limit = 100
): Promise<ExamScoreRow[]> {
  const { data, error } = await educationModule(client)
    .from(ENDPOINTS.examScores)
    .select(SELECTS.examScores)
    .order("submitted_at", { ascending: false, nullsFirst: false })
    .limit(limit);
  if (error) throw error;
  return (data ?? []).map(
    (row: {
      id: string;
      score: string;
      submitted_at: string | null;
      enrollment: { student_id: string }[] | null;
      module_exam: { type: string }[] | null;
    }) => ({
      id: row.id,
      student_id: row.enrollment?.[0]?.student_id ?? "",
      exam_code: "OTHER",
      overall_score: row.score,
      tested_on: row.submitted_at?.slice(0, 10) ?? null,
      verified: true,
    })
  );
}

function embeddedName(
  rel: { name: string } | { name: string }[] | null | undefined
): string | undefined {
  if (!rel) return undefined;
  const o = Array.isArray(rel) ? rel[0] : rel;
  return o && typeof o.name === "string" ? o.name : undefined;
}

type ScholarshipDbRow = {
  id: string;
  university_id: string;
  course_id: string | null;
  name: string;
  amount: string | number | null;
  eligibility: string | null;
  deadline: string | null;
  university?: { name: string } | { name: string }[] | null;
  course?: { name: string } | { name: string }[] | null;
};

function mapScholarshipRow(row: ScholarshipDbRow): ScholarshipRow {
  return {
    id: row.id,
    university_id: row.university_id,
    course_id: row.course_id,
    name: row.name,
    amount: row.amount != null && row.amount !== "" ? String(row.amount) : null,
    eligibility: row.eligibility,
    deadline: row.deadline,
    university_name: embeddedName(row.university),
    course_name: embeddedName(row.course),
  };
}

function normalizeScholarshipInsert(payload: CreateScholarshipInput) {
  const name = String(payload.name).trim();
  const university_id = String(payload.university_id).trim();
  let amount: number | null = null;
  if (payload.amount != null && payload.amount !== "") {
    const n =
      typeof payload.amount === "number"
        ? payload.amount
        : Number(String(payload.amount).trim());
    if (Number.isFinite(n)) amount = n;
  }
  const courseRaw = payload.course_id;
  const course_id =
    courseRaw == null || String(courseRaw).trim() === ""
      ? null
      : String(courseRaw).trim();
  const eligibility =
    payload.eligibility == null || String(payload.eligibility).trim() === ""
      ? null
      : String(payload.eligibility).trim();
  const deadline =
    payload.deadline == null || String(payload.deadline).trim() === ""
      ? null
      : String(payload.deadline).trim().slice(0, 10);
  return {
    university_id,
    course_id,
    name,
    amount,
    eligibility,
    deadline,
  };
}

function normalizeScholarshipUpdate(
  patch: UpdateScholarshipInput
): Record<string, unknown> {
  const out: Record<string, unknown> = {};
  if (patch.university_id !== undefined) {
    out.university_id = String(patch.university_id).trim();
  }
  if (patch.name !== undefined) {
    out.name = String(patch.name).trim();
  }
  if (patch.course_id !== undefined) {
    const raw = patch.course_id;
    out.course_id =
      raw == null || String(raw).trim() === "" ? null : String(raw).trim();
  }
  if (patch.amount !== undefined) {
    if (patch.amount === null || patch.amount === "") {
      out.amount = null;
    } else {
      const n =
        typeof patch.amount === "number"
          ? patch.amount
          : Number(String(patch.amount).trim());
      out.amount = Number.isFinite(n) ? n : null;
    }
  }
  if (patch.eligibility !== undefined) {
    const v = patch.eligibility;
    out.eligibility =
      v == null || String(v).trim() === "" ? null : String(v).trim();
  }
  if (patch.deadline !== undefined) {
    const v = patch.deadline;
    out.deadline =
      v == null || String(v).trim() === ""
        ? null
        : String(v).trim().slice(0, 10);
  }
  return out;
}

export async function listScholarships(
  client: SupabaseClient,
  limit = 100
): Promise<ScholarshipRow[]> {
  const { data, error } = await educationModule(client)
    .from(ENDPOINTS.scholarships)
    .select(SELECTS.scholarships)
    .order("deadline", { ascending: true, nullsFirst: false })
    .limit(limit);
  if (error) throw error;
  return (data ?? []).map((row) => mapScholarshipRow(row as ScholarshipDbRow));
}

export async function listScholarshipsByUniversityId(
  client: SupabaseClient,
  universityId: string
): Promise<ScholarshipRow[]> {
  const { data, error } = await educationModule(client)
    .from(ENDPOINTS.scholarships)
    .select(SELECTS.scholarships)
    .eq("university_id", universityId)
    .order("name");
  if (error) throw error;
  return (data ?? []).map((row) => mapScholarshipRow(row as ScholarshipDbRow));
}

/** Scholarships tied to the course, plus university-wide rows (`course_id` null). */
export async function listScholarshipsForCourse(
  client: SupabaseClient,
  courseId: string,
  universityId: string
): Promise<ScholarshipRow[]> {
  const [
    { data: forCourse, error: errCourse },
    { data: forUni, error: errUni },
  ] = await Promise.all([
    educationModule(client)
      .from(ENDPOINTS.scholarships)
      .select(SELECTS.scholarships)
      .eq("course_id", courseId),
    educationModule(client)
      .from(ENDPOINTS.scholarships)
      .select(SELECTS.scholarships)
      .eq("university_id", universityId)
      .is("course_id", null),
  ]);
  if (errCourse) throw errCourse;
  if (errUni) throw errUni;
  const byId = new Map<string, ScholarshipRow>();
  for (const row of [...(forCourse ?? []), ...(forUni ?? [])]) {
    const r = mapScholarshipRow(row as ScholarshipDbRow);
    byId.set(r.id, r);
  }
  return Array.from(byId.values()).sort((a, b) => a.name.localeCompare(b.name));
}

export async function createScholarship(
  client: SupabaseClient,
  payload: CreateScholarshipInput
): Promise<ScholarshipRow> {
  const { data, error } = await educationModule(client)
    .from(ENDPOINTS.scholarships)
    .insert(normalizeScholarshipInsert(payload))
    .select(SELECTS.scholarships)
    .single();
  if (error) throw error;
  return mapScholarshipRow(data as ScholarshipDbRow);
}

export async function updateScholarship(
  client: SupabaseClient,
  id: string,
  patch: UpdateScholarshipInput
): Promise<ScholarshipRow> {
  const normalized = normalizeScholarshipUpdate(patch);
  if (Object.keys(normalized).length === 0) {
    const { data, error } = await educationModule(client)
      .from(ENDPOINTS.scholarships)
      .select(SELECTS.scholarships)
      .eq("id", id)
      .maybeSingle();
    if (error) throw error;
    if (!data) throw new Error("Scholarship not found.");
    return mapScholarshipRow(data as ScholarshipDbRow);
  }
  const { data, error } = await educationModule(client)
    .from(ENDPOINTS.scholarships)
    .update(normalized)
    .eq("id", id)
    .select(SELECTS.scholarships)
    .single();
  if (error) throw error;
  return mapScholarshipRow(data as ScholarshipDbRow);
}

export async function deleteScholarship(
  client: SupabaseClient,
  id: string
): Promise<void> {
  const { error } = await educationModule(client)
    .from(ENDPOINTS.scholarships)
    .delete()
    .eq("id", id);
  if (error) throw error;
}

type VisaDbRow = {
  id: string;
  country_id: number;
  document_name: string;
  description: string | null;
  is_mandatory: boolean;
};

function mapVisaRow(row: VisaDbRow): VisaChecklistRow {
  return {
    id: row.id,
    country_id: String(row.country_id),
    document_name: row.document_name,
    description: row.description,
    is_mandatory: row.is_mandatory,
  };
}

function normalizeVisaInsert(payload: CreateVisaChecklistInput) {
  return {
    country_id: Number(String(payload.country_id).trim()),
    document_name: String(payload.document_name).trim(),
    description:
      payload.description == null || String(payload.description).trim() === ""
        ? null
        : String(payload.description).trim(),
    is_mandatory: payload.is_mandatory ?? true,
  };
}

function normalizeVisaUpdate(
  patch: UpdateVisaChecklistInput
): Record<string, unknown> {
  const out: Record<string, unknown> = {};
  if (patch.country_id !== undefined) {
    out.country_id = Number(String(patch.country_id).trim());
  }
  if (patch.document_name !== undefined) {
    out.document_name = String(patch.document_name).trim();
  }
  if (patch.description !== undefined) {
    const v = patch.description;
    out.description =
      v == null || String(v).trim() === "" ? null : String(v).trim();
  }
  if (patch.is_mandatory !== undefined) {
    out.is_mandatory = Boolean(patch.is_mandatory);
  }
  return out;
}

export async function listVisaChecklistByCountryId(
  client: SupabaseClient,
  countryId: string
): Promise<VisaChecklistRow[]> {
  const n = Number(String(countryId).trim());
  if (!Number.isFinite(n)) return [];
  const { data, error } = await educationModule(client)
    .from(ENDPOINTS.visaChecklistItems)
    .select(SELECTS.visaChecklistItems)
    .eq("country_id", n)
    .order("document_name", { ascending: true });
  if (error) throw error;
  return (data ?? []).map((row) => mapVisaRow(row as VisaDbRow));
}

export async function listVisaChecklistItems(
  client: SupabaseClient,
  limit = 200
): Promise<VisaChecklistRow[]> {
  const { data, error } = await educationModule(client)
    .from(ENDPOINTS.visaChecklistItems)
    .select(SELECTS.visaChecklistItems)
    .order("country_id", { ascending: true })
    .order("document_name", { ascending: true })
    .limit(limit);
  if (error) throw error;
  return (data ?? []).map((row) => mapVisaRow(row as VisaDbRow));
}

export async function createVisaChecklistItem(
  client: SupabaseClient,
  payload: CreateVisaChecklistInput
): Promise<VisaChecklistRow> {
  const { data, error } = await educationModule(client)
    .from(ENDPOINTS.visaChecklistItems)
    .insert(normalizeVisaInsert(payload))
    .select(SELECTS.visaChecklistItems)
    .single();
  if (error) throw error;
  return mapVisaRow(data as VisaDbRow);
}

export async function updateVisaChecklistItem(
  client: SupabaseClient,
  id: string,
  patch: UpdateVisaChecklistInput
): Promise<VisaChecklistRow> {
  const normalized = normalizeVisaUpdate(patch);
  if (Object.keys(normalized).length === 0) {
    const { data, error } = await educationModule(client)
      .from(ENDPOINTS.visaChecklistItems)
      .select(SELECTS.visaChecklistItems)
      .eq("id", id)
      .maybeSingle();
    if (error) throw error;
    if (!data) throw new Error("Visa checklist item not found.");
    return mapVisaRow(data as VisaDbRow);
  }
  const { data, error } = await educationModule(client)
    .from(ENDPOINTS.visaChecklistItems)
    .update(normalized)
    .eq("id", id)
    .select(SELECTS.visaChecklistItems)
    .single();
  if (error) throw error;
  return mapVisaRow(data as VisaDbRow);
}

export async function deleteVisaChecklistItem(
  client: SupabaseClient,
  id: string
): Promise<void> {
  const { error } = await educationModule(client)
    .from(ENDPOINTS.visaChecklistItems)
    .delete()
    .eq("id", id);
  if (error) throw error;
}

export async function listCostBenchmarks(
  client: SupabaseClient,
  limit = 200
): Promise<CostBenchmarkRow[]> {
  void client;
  void limit;
  return [];
}

export async function listEligibilityRulesets(
  client: SupabaseClient,
  limit = 100
): Promise<EligibilityRulesetRow[]> {
  void client;
  void limit;
  return [];
}

export async function listApplications(
  client: SupabaseClient,
  limit = 100
): Promise<ApplicationRow[]> {
  const { data, error } = await educationModule(client)
    .from(ENDPOINTS.enrollments)
    .select(SELECTS.enrollments)
    .order("created_at", { ascending: false })
    .limit(limit);
  if (error) throw error;
  return (data ?? []).map(
    (row: {
      id: string;
      student_id: string;
      course_id: string;
      status: string;
      created_at: string;
    }) => ({
      id: row.id,
      student_id: row.student_id,
      course_id: row.course_id,
      status: "under_review",
      submitted_at: row.created_at,
    })
  );
}

export async function insertMarkListUploadRow(
  client: SupabaseClient,
  row: {
    student_id: string;
    storage_object_path: string;
    original_filename: string | null;
    mime_type: string | null;
    uploaded_by: string;
  }
) {
  void client;
  void row;
  void EDUCATION_MARK_LIST_BUCKET;
  throw new Error(
    "Mark list uploads are not available in the current education_module schema."
  );
}

/** Serializable row shapes for education admin (DB ↔ presentation). */

export type CourseLevel =
  | "foundation"
  | "undergraduate"
  | "postgraduate"
  | "doctoral"
  | "diploma"
  | "certificate"
  | "other";

export type MarkListUploadStatus =
  | "pending"
  | "processing"
  | "parsed"
  | "failed"
  | "archived";

export type ApplicationStatus =
  | "draft"
  | "submitted"
  | "under_review"
  | "accepted"
  | "rejected"
  | "withdrawn";

export type ExamCode =
  | "IELTS"
  | "TOEFL"
  | "GRE"
  | "GMAT"
  | "SAT"
  | "PTE"
  | "DUOLINGO"
  | "OTHER";

export type CostCategory =
  | "tuition"
  | "living"
  | "visa"
  | "insurance"
  | "travel"
  | "other";

export type EducationDashboardCounts = {
  countries: number;
  universities: number;
  courses: number;
  students: number;
  scholarships: number;
  markUploadsPending: number;
};

export type CountryRow = {
  id: string;
  iso_code: string;
  name: string;
  active: boolean;
  sort_order: number;
};

export type CreateCountryInput = {
  iso_code: string;
  name: string;
  active?: boolean;
};

export type UniversityRow = {
  id: string;
  country_id: string;
  name: string;
  city: string | null;
  website_url: string | null;
  ranking: number | null;
};

export type CreateUniversityInput = {
  country_id: string;
  name: string;
  city?: string | null;
  website_url?: string | null;
  ranking?: number | null;
};

export type UpdateUniversityInput = Partial<CreateUniversityInput>;

export type UniversityImageRow = {
  id: string;
  university_id: string;
  file_path: string;
  is_primary: boolean;
};

/** `education_module.courses` — aligned with migrations. */
export type CourseRow = {
  id: string;
  university_id: string;
  /** Set when list query joins `university:university_id(name)`. */
  university_name?: string;
  name: string;
  degree: string | null;
  field_of_study: string | null;
  duration_months: number | null;
  tuition_fee: string | null;
  currency: string | null;
  min_qualification: string | null;
};

export type CreateCourseInput = {
  university_id: string;
  name: string;
  degree?: string | null;
  field_of_study?: string | null;
  duration_months?: number | null;
  tuition_fee?: number | string | null;
  currency?: string | null;
  min_qualification?: string | null;
};

export type UpdateCourseInput = Partial<CreateCourseInput>;

export type CourseImageRow = {
  id: string;
  course_id: string;
  file_path: string;
  is_primary: boolean;
};

export type StudentProfileRow = {
  id: string;
  full_name: string;
  email: string | null;
  nationality_country_id: string | null;
  external_student_ref: string | null;
};

export type MarkListUploadRow = {
  id: string;
  student_id: string;
  original_filename: string | null;
  status: MarkListUploadStatus;
  created_at: string;
};

export type ExamScoreRow = {
  id: string;
  student_id: string;
  exam_code: ExamCode;
  overall_score: string | null;
  tested_on: string | null;
  verified: boolean;
};

/** `education_module.scholarships` */
export type ScholarshipRow = {
  id: string;
  university_id: string;
  course_id: string | null;
  name: string;
  amount: string | null;
  eligibility: string | null;
  deadline: string | null;
  university_name?: string;
  course_name?: string;
};

export type CreateScholarshipInput = {
  university_id: string;
  course_id?: string | null;
  name: string;
  amount?: number | string | null;
  eligibility?: string | null;
  deadline?: string | null;
};

export type UpdateScholarshipInput = Partial<CreateScholarshipInput>;

/** `education_module.visa_checklists` */
export type VisaChecklistRow = {
  id: string;
  country_id: string;
  document_name: string;
  description: string | null;
  is_mandatory: boolean;
};

export type CreateVisaChecklistInput = {
  country_id: string;
  document_name: string;
  description?: string | null;
  is_mandatory?: boolean;
};

export type UpdateVisaChecklistInput = Partial<CreateVisaChecklistInput>;

export type CostBenchmarkRow = {
  id: string;
  country_id: string;
  category: CostCategory;
  amount_monthly: string | null;
  amount_yearly: string | null;
  currency: string;
  notes: string | null;
};

export type EligibilityRulesetRow = {
  id: string;
  name: string;
  target_type: string;
  version: number;
  active: boolean;
};

export type ApplicationRow = {
  id: string;
  student_id: string;
  course_id: string;
  status: ApplicationStatus;
  submitted_at: string | null;
};

/** `education_module.intakes` */
export type IntakeRow = {
  id: string;
  course_id: string;
  course_name?: string;
  name: string;
  start_date: string | null;
  application_deadline: string | null;
  seats_available: number | null;
};

export type CreateIntakeInput = {
  course_id: string;
  name: string;
  start_date?: string | null;
  application_deadline?: string | null;
  /** Accepts JSON numeric strings from HTTP bodies as well as numbers. */
  seats_available?: number | string | null;
};

export type UpdateIntakeInput = Partial<CreateIntakeInput>;

export type AiRunSummary = {
  eligibilityRuns: number;
  recommendationRuns: number;
  documentAnalyses: number;
  chatSessions: number;
};

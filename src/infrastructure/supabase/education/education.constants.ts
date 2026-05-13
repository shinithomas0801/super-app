export const EDUCATION_MARK_LIST_BUCKET = "education-mark-lists" as const;

/** Supabase Storage bucket for university photos (Dashboard → Storage). */
export const EDUCATION_UNIVERSITY_IMAGES_BUCKET = "university_images" as const;

/** Supabase Storage bucket for course catalog images. */
export const EDUCATION_COURSE_IMAGES_BUCKET = "course_images" as const;

export const EDUCATION_ENDPOINTS = {
  // public schema
  countries: "countries",
  studentProfiles: "app_users",

  // education_module schema
  academicRecords: "academic_records",
  universities: "universities",
  universityImages: "university_images",
  courses: "courses",
  courseImages: "course_images",
  courseModules: "course_modules",
  intakes: "intakes",
  enrollments: "enrollments",
  moduleExams: "module_exams",
  scholarships: "scholarships",
  visaChecklistItems: "visa_checklists",
  examScores: "exam_scores",
  moduleProgress: "module_progress",
  courseProgress: "course_progress",
} as const;

export const EDUCATION_SELECTS = {
  // public schema
  countries: "id, name, iso_code",
  studentProfiles: "id, full_name",

  // education_module schema
  academicRecords:
    "id, student_id, qualification_level, institution_name, board_or_university, year_of_completion, grade, created_at",
  universities: "id, country_id, name, city, website, ranking",
  universityImages: "id, university_id, file_path, is_primary",
  courses:
    "id, university_id, name, degree, min_qualification, duration_months, tuition_fee, currency, field_of_study",
  /** List view: includes hosting university name. */
  coursesWithUniversity:
    "id, university_id, name, degree, min_qualification, duration_months, tuition_fee, currency, field_of_study, university:university_id(name)",
  courseImages: "id, course_id, file_path, is_primary",
  courseModules:
    "id, course_id, name, description, order_index, duration_hours, is_mandatory, created_at",
  intakes:
    "id, course_id, name, start_date, application_deadline, seats_available, course:course_id(name)",
  enrollments: "id, student_id, course_id, status, created_at",
  moduleExams:
    "id, course_id, module_id, name, type, max_score, pass_score, scheduled_date",
  scholarships:
    "id, university_id, course_id, name, amount, eligibility, deadline, university:university_id(name), course:course_id(name)",
  visaChecklistItems:
    "id, country_id, document_name, description, is_mandatory",
  examScores:
    "id, score, submitted_at, enrollment:enrollment_id(student_id), module_exam:module_exam_id(type)",
  moduleProgress:
    "id, enrollment_id, module_id, status, progress_percentage, completed_at",
  courseProgress:
    "id, enrollment_id, course_id, progress_percentage, status, last_accessed_at",
} as const;

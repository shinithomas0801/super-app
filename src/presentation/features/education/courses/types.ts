import type { CourseRow, UniversityRow } from "@/domain/education";

export type CourseManagementProps = {
  courses: CourseRow[];
  universities: UniversityRow[];
};

export type CourseCreateFormState = {
  university_id: string;
  name: string;
  degree: string;
  field_of_study: string;
  duration_months: string;
  tuition_fee: string;
  currency: string;
  min_qualification: string;
};

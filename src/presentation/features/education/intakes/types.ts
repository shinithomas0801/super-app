import type { CourseRow, IntakeRow } from "@/domain/education";

export type IntakeManagementProps = {
  intakes: IntakeRow[];
  courses: CourseRow[];
};

export type IntakeFormState = {
  course_id: string;
  name: string;
  start_date: string;
  application_deadline: string;
  seats_available: string;
};

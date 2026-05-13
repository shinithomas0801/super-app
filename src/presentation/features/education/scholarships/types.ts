import type {
  CourseRow,
  ScholarshipRow,
  UniversityRow,
} from "@/domain/education";

export type ScholarshipManagementProps = {
  scholarships: ScholarshipRow[];
  universities: UniversityRow[];
  courses: CourseRow[];
};

export type ScholarshipFormState = {
  university_id: string;
  course_id: string;
  name: string;
  amount: string;
  eligibility: string;
  deadline: string;
};

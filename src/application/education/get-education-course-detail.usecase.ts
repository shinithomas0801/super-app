import type {
  CourseImageRow,
  CourseRow,
  ScholarshipRow,
  VisaChecklistRow,
} from "@/domain/education";
import {
  getCourseById,
  getUniversityById,
  listCourseImages,
  listScholarshipsForCourse,
  listVisaChecklistByCountryId,
} from "@/infrastructure/supabase/education/education.repository";
import { withEducationAdmin } from "./with-education-admin";

export type EducationCourseDetail = {
  course: CourseRow;
  images: CourseImageRow[];
  universityName: string;
  scholarships: ScholarshipRow[];
  visaChecklist: VisaChecklistRow[];
};

export type EducationCourseDetailResult =
  | { found: true; detail: EducationCourseDetail }
  | { found: false };

export async function getEducationCourseDetailUseCase(
  id: string
): Promise<EducationCourseDetailResult> {
  return withEducationAdmin(async (supabase) => {
    const course = await getCourseById(supabase, id);
    if (!course) {
      return { found: false };
    }
    const [images, university] = await Promise.all([
      listCourseImages(supabase, id),
      getUniversityById(supabase, course.university_id),
    ]);
    const universityName = university?.name ?? course.university_id;
    const [scholarships, visaChecklist] = await Promise.all([
      listScholarshipsForCourse(supabase, id, course.university_id),
      university
        ? listVisaChecklistByCountryId(supabase, university.country_id)
        : Promise.resolve([] as VisaChecklistRow[]),
    ]);
    return {
      found: true,
      detail: {
        course,
        images,
        universityName,
        scholarships,
        visaChecklist,
      },
    };
  });
}

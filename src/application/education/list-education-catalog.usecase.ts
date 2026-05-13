import type {
  CountryRow,
  CourseRow,
  UniversityRow,
} from "@/domain/education";
import {
  listCountries,
  listCourses,
  listUniversities,
} from "@/infrastructure/supabase/education/education.repository";
import { withEducationAdmin } from "./with-education-admin";

export type EducationCatalogLists = {
  countries: CountryRow[];
  universities: UniversityRow[];
  courses: CourseRow[];
};

export async function listEducationCatalogUseCase(): Promise<EducationCatalogLists> {
  return withEducationAdmin(async (supabase) => {
    const [countries, universities, courses] = await Promise.all([
      listCountries(supabase),
      listUniversities(supabase),
      listCourses(supabase),
    ]);
    return { countries, universities, courses };
  });
}

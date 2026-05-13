import type {
  ScholarshipRow,
  UniversityImageRow,
  UniversityRow,
  VisaChecklistRow,
} from "@/domain/education";
import {
  getUniversityById,
  listCountriesForAdmin,
  listScholarshipsByUniversityId,
  listUniversityImages,
  listVisaChecklistByCountryId,
} from "@/infrastructure/supabase/education/education.repository";
import { withEducationAdmin } from "./with-education-admin";

export type EducationUniversityDetail = {
  university: UniversityRow;
  images: UniversityImageRow[];
  countryName: string;
  scholarships: ScholarshipRow[];
  visaChecklist: VisaChecklistRow[];
};

export type EducationUniversityDetailResult =
  | { found: true; detail: EducationUniversityDetail }
  | { found: false };

export async function getEducationUniversityDetailUseCase(
  id: string
): Promise<EducationUniversityDetailResult> {
  return withEducationAdmin(async (supabase) => {
    const university = await getUniversityById(supabase, id);
    if (!university) {
      return { found: false };
    }
    const [images, countries, scholarships, visaChecklist] = await Promise.all([
      listUniversityImages(supabase, id),
      listCountriesForAdmin(supabase),
      listScholarshipsByUniversityId(supabase, id),
      listVisaChecklistByCountryId(supabase, university.country_id),
    ]);
    const countryName =
      countries.find((c) => c.id === university.country_id)?.name ??
      university.country_id;
    return {
      found: true,
      detail: {
        university,
        images,
        countryName,
        scholarships,
        visaChecklist,
      },
    };
  });
}

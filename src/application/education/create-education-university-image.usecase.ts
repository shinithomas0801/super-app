import type { UniversityImageRow } from "@/domain/education";
import { insertUniversityImage } from "@/infrastructure/supabase/education/education.repository";
import { withEducationAdmin } from "./with-education-admin";

export async function createEducationUniversityImageUseCase(
  universityId: string,
  filePath: string
): Promise<UniversityImageRow> {
  return withEducationAdmin((supabase) =>
    insertUniversityImage(supabase, universityId, filePath)
  );
}

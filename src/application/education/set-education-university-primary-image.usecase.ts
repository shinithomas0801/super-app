import { setUniversityPrimaryImage } from "@/infrastructure/supabase/education/education.repository";
import { withEducationAdmin } from "./with-education-admin";

export async function setEducationUniversityPrimaryImageUseCase(
  universityId: string,
  imageId: string
): Promise<void> {
  return withEducationAdmin((supabase) =>
    setUniversityPrimaryImage(supabase, universityId, imageId)
  );
}

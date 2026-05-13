import { deleteUniversityImage } from "@/infrastructure/supabase/education/education.repository";
import { removeUniversityImageFromBucket } from "@/infrastructure/supabase/education/university-images-storage";
import { withEducationAdmin } from "./with-education-admin";

export async function deleteEducationUniversityImageUseCase(
  universityId: string,
  imageId: string
): Promise<void> {
  return withEducationAdmin(async (supabase) => {
    const file_path = await deleteUniversityImage(
      supabase,
      universityId,
      imageId
    );
    if (file_path) {
      await removeUniversityImageFromBucket(supabase, file_path);
    }
  });
}

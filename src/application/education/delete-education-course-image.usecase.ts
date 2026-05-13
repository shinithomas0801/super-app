import { deleteCourseImage } from "@/infrastructure/supabase/education/education.repository";
import { removeCourseImageFromBucket } from "@/infrastructure/supabase/education/course-images-storage";
import { withEducationAdmin } from "./with-education-admin";

export async function deleteEducationCourseImageUseCase(
  courseId: string,
  imageId: string
): Promise<void> {
  return withEducationAdmin(async (supabase) => {
    const file_path = await deleteCourseImage(supabase, courseId, imageId);
    if (file_path) {
      await removeCourseImageFromBucket(supabase, file_path);
    }
  });
}

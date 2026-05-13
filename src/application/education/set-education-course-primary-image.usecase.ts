import { setCoursePrimaryImage } from "@/infrastructure/supabase/education/education.repository";
import { withEducationAdmin } from "./with-education-admin";

export async function setEducationCoursePrimaryImageUseCase(
  courseId: string,
  imageId: string
): Promise<void> {
  return withEducationAdmin((supabase) =>
    setCoursePrimaryImage(supabase, courseId, imageId)
  );
}

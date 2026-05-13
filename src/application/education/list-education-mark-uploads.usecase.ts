import type { MarkListUploadRow } from "@/domain/education";
import { listMarkListUploads } from "@/infrastructure/supabase/education/education.repository";
import { withEducationAdmin } from "./with-education-admin";

export async function listEducationMarkUploadsUseCase(): Promise<
  MarkListUploadRow[]
> {
  return withEducationAdmin((supabase) => listMarkListUploads(supabase));
}

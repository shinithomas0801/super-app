import { EducationAccessError } from "@/domain/education";
import { getEducationDashboardUseCase } from "@/application/education";
import { EducationAccessNotice } from "../components/EducationAccessNotice";
import { EducationDashboardPresenter } from "../presenters/EducationDashboard.presenter";

export async function EducationDashboardContainer() {
  try {
    const counts = await getEducationDashboardUseCase();
    return <EducationDashboardPresenter counts={counts} />;
  } catch (error) {
    if (error instanceof EducationAccessError) {
      return <EducationAccessNotice message={error.message} />;
    }
    throw error;
  }
}

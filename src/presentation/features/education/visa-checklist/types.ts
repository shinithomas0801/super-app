import type { CountryRow, VisaChecklistRow } from "@/domain/education";

export type VisaChecklistManagementProps = {
  items: VisaChecklistRow[];
  countries: CountryRow[];
};

export type VisaChecklistFormState = {
  country_id: string;
  document_name: string;
  description: string;
  is_mandatory: boolean;
};

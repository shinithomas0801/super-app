import type { CountryRow, UniversityRow } from "@/domain/education";

export type UniversityFormState = {
  country_id: string;
  name: string;
  city: string;
  website_url: string;
  ranking: string;
};

export type UniversityManagementProps = {
  universities: UniversityRow[];
  countries: CountryRow[];
};

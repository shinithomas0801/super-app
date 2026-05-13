export class EducationAccessError extends Error {
  readonly code = "EDUCATION_ACCESS";

  constructor(message: string) {
    super(message);
    this.name = "EducationAccessError";
  }
}

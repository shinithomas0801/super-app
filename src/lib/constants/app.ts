/**
 * App-wide constants (Single Responsibility)
 */

export const APP_NAME = "Next.js Users Template";

export const ROUTES = {
  HOME: "/",
  LOGIN: "/login",
  EDUCATION: "/education",
  EDUCATION_STUDENTS: "/education/students",
  EDUCATION_MARK_LISTS: "/education/mark-lists",
  EDUCATION_EXAMS: "/education/exams",
  EDUCATION_UNIVERSITIES: "/education/universities",
  EDUCATION_COURSES: "/education/courses",
  EDUCATION_INTAKES: "/education/intakes",
  EDUCATION_FILTERS: "/education/filters",
  EDUCATION_SCHOLARSHIPS: "/education/scholarships",
  EDUCATION_VISA: "/education/visa-checklist",
  EDUCATION_COSTS: "/education/cost-calculator",
  EDUCATION_ANALYTICS: "/education/analytics",
} as const;

export const STORAGE_KEYS = {
  THEME: "app-theme",
  SIDEBAR_OPEN: "sidebar-open",
} as const;

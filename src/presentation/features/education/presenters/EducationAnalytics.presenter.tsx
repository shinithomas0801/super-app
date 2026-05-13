import type {
  ApplicationStatus,
  EducationDashboardCounts,
} from "@/domain/education";

const applicationLabels: Record<ApplicationStatus, string> = {
  draft: "Draft",
  submitted: "Submitted",
  under_review: "Under review",
  accepted: "Accepted",
  rejected: "Rejected",
  withdrawn: "Withdrawn",
};

type Props = {
  analytics: {
    dashboard: EducationDashboardCounts;
    applicationsByStatus: Record<ApplicationStatus, number>;
  };
};

export function EducationAnalyticsPresenter({ analytics }: Props) {
  const { dashboard, applicationsByStatus } = analytics;

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-xl font-bold text-gray-900">Analytics dashboard</h1>
        <p className="mt-1 text-sm text-gray-600">
          Aggregates from Supabase using education-scoped tables and AI audit
          logs.
        </p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4 mb-10">
        {(
          [
            ["Universities", dashboard.universities],
            ["Courses", dashboard.courses],
            ["Students", dashboard.students],
            ["Scholarships", dashboard.scholarships],
          ] as const
        ).map(([label, value]) => (
          <div
            key={label}
            className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm"
          >
            <p className="text-sm font-medium text-gray-500">{label}</p>
            <p className="mt-2 text-3xl font-semibold tabular-nums">{value}</p>
          </div>
        ))}
      </div>

      <div className="rounded-xl border border-gray-200 bg-white p-6">
        <h2 className="text-sm font-semibold text-gray-900 mb-4">
          Applications by status
        </h2>
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {(Object.keys(applicationsByStatus) as ApplicationStatus[]).map(
            (status) => (
              <div
                key={status}
                className="flex items-center justify-between rounded-lg bg-gray-50 px-4 py-3"
              >
                <span className="text-sm text-gray-700">
                  {applicationLabels[status]}
                </span>
                <span className="text-lg font-semibold tabular-nums">
                  {applicationsByStatus[status]}
                </span>
              </div>
            )
          )}
        </div>
      </div>
    </div>
  );
}

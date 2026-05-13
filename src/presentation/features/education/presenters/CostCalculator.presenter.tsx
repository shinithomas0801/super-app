"use client";

import { useMemo, useState } from "react";
import type { CostBenchmarkRow, CountryRow } from "@/domain/education";

type Props = {
  countries: CountryRow[];
  benchmarks: CostBenchmarkRow[];
};

export function CostCalculatorPresenter({ countries, benchmarks }: Props) {
  const [countryId, setCountryId] = useState(countries[0]?.id ?? "");
  const [months, setMonths] = useState(12);

  const rows = useMemo(() => {
    return benchmarks.filter((b) => b.country_id === countryId);
  }, [benchmarks, countryId]);

  const totals = useMemo(() => {
    let monthlySum = 0;
    let yearlySum = 0;
    for (const r of rows) {
      if (r.amount_monthly != null)
        monthlySum += Number.parseFloat(r.amount_monthly);
      if (r.amount_yearly != null)
        yearlySum += Number.parseFloat(r.amount_yearly);
    }
    const currency = rows[0]?.currency ?? "USD";
    const blendedMonthly =
      monthlySum + (yearlySum > 0 ? yearlySum / 12 : 0);
    const studyMonthsEstimate = months;
    const livingEstimate = blendedMonthly * studyMonthsEstimate;
    const tuitionRow = rows.find((r) => r.category === "tuition");
    const tuitionYearly = tuitionRow?.amount_yearly
      ? Number.parseFloat(tuitionRow.amount_yearly)
      : tuitionRow?.amount_monthly
        ? Number.parseFloat(tuitionRow.amount_monthly) * 12
        : 0;
    const tuitionForStay =
      tuitionYearly > 0 ? (tuitionYearly / 12) * studyMonthsEstimate : 0;
    const grandTotal = livingEstimate + tuitionForStay;
    return {
      currency,
      blendedMonthly,
      livingEstimate,
      tuitionForStay,
      grandTotal,
    };
  }, [rows, months]);

  const countryName =
    countries.find((c) => c.id === countryId)?.name ?? "Selected country";

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-xl font-bold text-gray-900">Cost calculator</h1>
        <p className="mt-1 text-sm text-gray-600">
          Admin-facing estimate using{" "}
          <code className="rounded bg-gray-100 px-1 text-xs">
            education_cost_benchmarks
          </code>
          . Tune benchmarks per country; this UI sums monthly and yearly
          components across categories.
        </p>
      </div>

      <div className="mb-6 flex flex-wrap gap-4">
        <label className="flex flex-col gap-1 text-sm">
          <span className="text-gray-600">Country</span>
          <select
            className="rounded-md border border-gray-300 bg-white px-3 py-2 text-sm"
            value={countryId}
            onChange={(e) => setCountryId(e.target.value)}
          >
            {countries.map((c) => (
              <option key={c.id} value={c.id}>
                {c.name} ({c.iso_code})
              </option>
            ))}
          </select>
        </label>
        <label className="flex flex-col gap-1 text-sm">
          <span className="text-gray-600">Study duration (months)</span>
          <input
            type="number"
            min={1}
            max={120}
            value={months}
            onChange={(e) => setMonths(Number(e.target.value))}
            className="w-32 rounded-md border border-gray-300 bg-white px-3 py-2 text-sm"
          />
        </label>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <div className="rounded-xl border border-gray-200 bg-white p-5">
          <h2 className="text-sm font-semibold text-gray-900">
            Benchmarks for {countryName}
          </h2>
          <ul className="mt-3 space-y-2 text-sm text-gray-700">
            {rows.length === 0 ? (
              <li className="text-gray-500">No benchmarks for this country.</li>
            ) : (
              rows.map((r) => (
                <li key={r.id} className="flex justify-between gap-4">
                  <span className="capitalize">{r.category}</span>
                  <span className="text-gray-600">
                    {r.amount_monthly != null
                      ? `${r.amount_monthly}/mo`
                      : r.amount_yearly != null
                        ? `${r.amount_yearly}/yr`
                        : "—"}{" "}
                    {r.currency}
                  </span>
                </li>
              ))
            )}
          </ul>
        </div>
        <div className="rounded-xl border border-gray-200 bg-gray-50 p-5">
          <h2 className="text-sm font-semibold text-gray-900">Estimate</h2>
          <dl className="mt-3 space-y-2 text-sm">
            <div className="flex justify-between">
              <dt className="text-gray-600">Blended monthly burn</dt>
              <dd className="font-medium tabular-nums">
                {totals.blendedMonthly.toFixed(0)} {totals.currency}
              </dd>
            </div>
            <div className="flex justify-between">
              <dt className="text-gray-600">Living subtotal ({months} mo)</dt>
              <dd className="font-medium tabular-nums">
                {totals.livingEstimate.toFixed(0)} {totals.currency}
              </dd>
            </div>
            <div className="flex justify-between">
              <dt className="text-gray-600">Tuition (prorated)</dt>
              <dd className="font-medium tabular-nums">
                {totals.tuitionForStay.toFixed(0)} {totals.currency}
              </dd>
            </div>
            <div className="flex justify-between border-t border-gray-200 pt-3 text-base">
              <dt className="font-semibold text-gray-900">Total (rough)</dt>
              <dd className="font-semibold tabular-nums">
                {totals.grandTotal.toFixed(0)} {totals.currency}
              </dd>
            </div>
          </dl>
          <p className="mt-3 text-xs text-gray-500">
            Not financial advice—surface area for counselors to explain ranges.
          </p>
        </div>
      </div>
    </div>
  );
}

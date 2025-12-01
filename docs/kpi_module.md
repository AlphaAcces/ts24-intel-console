# KPI Module

**Last updated:** 30 Nov 2025

## Purpose

The KPI module derives key performance indicators from case data and displays them in the executive dashboard. KPIs include risk score, open actions count, liquidity, and days sales outstanding (DSO).

---

## Where in the Code

| Component/File | Path | Responsibility |
|----------------|------|----------------|
| KPI types | `src/domains/kpi/caseKpis.ts` | `CaseKpiSummary`, `CaseKpiMetric`, `KpiSeverity`, `KpiTrend` |
| Derive helper | `src/domains/kpi/caseKpis.ts` | `deriveKpisFromCaseData(caseData, opts)` |
| API route | `server/app.ts` (line ~75) | `GET /api/cases/:id/kpis` |
| API client | `src/domains/api/client.ts` | `fetchCaseKpis(id)` |
| DataContext | `src/context/DataContext.tsx` | `kpis`, `kpisLoading`, `kpisError`, `kpisSource` |
| ExecutiveSummaryView | `src/components/Executive/ExecutiveSummaryView.tsx` | KPI panel rendering |
| Tests | `server/__tests__/caseKpisApi.test.ts` | API endpoint tests |
| Tests | `src/components/Executive/__tests__/ExecutiveSummaryView.test.tsx` | UI tests |

---

## CaseKpiSummary Model

`CaseKpiSummary` represents the lightweight KPI snapshot that is shown across the executive dashboard:

```ts
export type CaseKpiSummary = {
  caseId: string;
  metrics: CaseKpiMetric[];
  generatedAt: string; // ISO-8601 timestamp
  source: 'derived' | 'api';
};

export type CaseKpiMetric = {
  id: string;
  label: string;
  value: number;
  unit?: string; // e.g. '%', 'DKK', 'days'
  trend?: 'up' | 'down' | 'flat';
  severity?: 'low' | 'medium' | 'high' | 'critical';
  hint?: string;
};
```

Deriving happens through `deriveKpisFromCaseData(caseData)` in `src/domains/kpi/caseKpis.ts`. Metrics are computed from the bundled TSL dataset (risk score, number of open actions, liquidity and DSO) so that the UI always has data even when the API is unreachable.

## API route

`GET /api/cases/:id/kpis` lives in `server/app.ts`. The handler:

1. Loads case data from the in-memory store.
2. Builds a summary via `deriveKpisFromCaseData`.
3. Returns `{ summary: CaseKpiSummary }` or `404` when the case id is unknown.

Coverage lives in `server/__tests__/caseKpisApi.test.ts`.

## Data loading & fallback

`DataContext` now holds:

- `kpis`, `kpisLoading`, `kpisError`, `kpisSource`.
- It first tries `fetchCaseKpis(caseId)`.
- On failure (or when the case API falls back to mock data) it derives KPIs locally with `deriveKpisFromCaseData` and marks the source as `derived`.
- All state resets when the active case changes, mirroring the events logic.

Tests for this behavior live in `src/context/__tests__/DataContext.test.tsx`.

## ExecutiveSummaryView integration

`ExecutiveSummaryView` now renders a dedicated "Case KPIs" strip:

- Uses `kpis` from `DataContext` to render four cards with severity badges, trend indicators and hints.
- Shows a skeleton grid while `kpisLoading` is true and a friendly empty-state otherwise.
- Displays the source badge (live vs. derived) plus the generated timestamp.

UI coverage is in `src/components/Executive/__tests__/ExecutiveSummaryView.test.tsx`.

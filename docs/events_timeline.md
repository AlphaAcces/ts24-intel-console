# Case Event Engine & Timeline

**Last updated:** 30 Nov 2025

## Purpose

The event engine derives case events from multiple data sources (timeline, actions, risk heatmap) and provides them to the UI via API or local derivation. The `CaseTimeline` component renders events grouped by day with severity badges.

---

## Where in the Code

| Component/File | Path | Responsibility |
|----------------|------|----------------|
| CaseEvent types | `src/domains/events/caseEvents.ts` | `CaseEvent`, `CaseEventSeverity` types |
| Derive helper | `src/domains/events/caseEvents.ts` | `deriveEventsFromCaseData(caseData, opts)` |
| API route | `server/app.ts` (line ~65) | `GET /api/cases/:id/events` |
| API client | `src/domains/api/client.ts` | `fetchCaseEvents(id)` |
| DataContext | `src/context/DataContext.tsx` | `events`, `eventsLoading`, `eventsError`, `eventsSource` |
| CaseTimeline UI | `src/components/Cases/CaseTimeline.tsx` | Grouped timeline with severity, source badge |
| i18n keys | `src/i18n/locales/{en,da}/cases.json` | `cases.timeline.*` translations |
| Tests | `server/__tests__/caseEventsApi.test.ts` | API endpoint tests |

---

## CaseEvent Model

```ts
export type CaseEventSeverity = 'low' | 'medium' | 'high' | 'critical';

export type CaseEvent = {
  id: string;
  caseId: string;
  timestamp: string; // ISO-8601 (UTC)
  type: string;      // functional bucket, e.g. payment contact, risk_flag
  severity: CaseEventSeverity;
  title: string;
  description?: string;
  source?: string;   // bank, osint, internal_note …
  tags?: string[];
  linkUrl?: string;
};
```

`deriveEventsFromCaseData(caseData, { caseId })` lives in `src/domains/events/caseEvents.ts` and produces a sorted array by combining:

- Timeline entries (`caseData.timelineData`).
- Priority actions (`caseData.actionsData`) promoted to `high` severity.
- Risk spikes derived from `caseData.riskHeatmapData` when a category hits `Critical`.

The helper always returns events in descending timestamp order.

## API: `GET /api/cases/:id/events`

Implemented in `server/app.ts`.

- Resolves the case via the same store as `GET /api/cases/:id`.
- Runs `deriveEventsFromCaseData` to keep the response side-effect free.
- Success payload: `{ events: CaseEvent[] }`.
- `404` is returned when the `caseId` is unknown (same error envelope as the case detail route).

`server/__tests__/caseEventsApi.test.ts` exercises both the happy path and the 404 branch.

## DataContext wiring

`DataProvider` now exposes:

- `events: CaseEvent[] | null` – null before the first load completes.
- `eventsLoading: boolean` – `true` while the API/derivation is running.
- `eventsError: Error | null` – populated when the API fails (we still render derived events).
- `eventsSource: 'api' | 'derived'` – lets the UI show whether we are on live data or a local snapshot.

Loading strategy:

1. Try `fetchCaseEvents(caseId)`.
2. On success → `eventsSource = 'api'`.
3. On failure → log the error, fallback to `deriveEventsFromCaseData`, set `eventsSource = 'derived'` but keep the error for observability.
4. When the case API is offline entirely we skip step 1 and go straight to derived data.

See `src/context/__tests__/DataContext.test.tsx` for mocks that cover both the API and fallback flows.

## CaseTimeline UI

`src/components/Cases/CaseTimeline.tsx` renders the grouped timeline:

- Skeleton/loader state while `eventsLoading` is true.
- Empty state when no events are available.
- Groups events per calendar day and shows severity, type, time, description, tags and optional source link.
- Displays a badge communicating whether data comes from the live API or the derived snapshot.

The component is embedded in `ExecutiveSummaryView` so that every case dashboard shows the timeline panel alongside the existing KPIs.

Translations live under `cases.timeline.*` (English + Danish locales updated).

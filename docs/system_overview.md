# TS24 Intel Console – System Overview

**Last updated:** 30 Nov 2025

This document provides a high-level overview of the main flows and architecture in TS24 Intel Console.

---

## Architecture Diagram

```text
┌─────────────────────────────────────────────────────────────────────────────┐
│                           TS24 Intel Console                                │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                             │
│  ┌─────────────┐    ┌─────────────┐    ┌─────────────┐    ┌─────────────┐  │
│  │   Auth      │    │   Cases     │    │   Events    │    │    KPI      │  │
│  │  (SSO/Login)│    │  (Library)  │    │ (Timeline)  │    │ (Dashboard) │  │
│  └──────┬──────┘    └──────┬──────┘    └──────┬──────┘    └──────┬──────┘  │
│         │                  │                  │                  │         │
│         └──────────────────┼──────────────────┼──────────────────┘         │
│                            │                  │                            │
│                     ┌──────┴──────┐    ┌──────┴──────┐                     │
│                     │ DataContext │    │ Export      │                     │
│                     │ (Provider)  │    │ (PDF/JSON)  │                     │
│                     └──────┬──────┘    └──────┬──────┘                     │
│                            │                  │                            │
└────────────────────────────┼──────────────────┼────────────────────────────┘
                             │                  │
                    ┌────────┴──────────────────┴────────┐
                    │        Express Server (API)        │
                    │         server/app.ts              │
                    ├────────────────────────────────────┤
                    │  /api/health                       │
                    │  /api/auth/sso-health              │
                    │  /api/cases                        │
                    │  /api/cases/:id                    │
                    │  /api/cases/:id/events             │
                    │  /api/cases/:id/kpis               │
                    │  /api/cases/:id/export             │
                    │  /api/tenant/:id/aiKey             │
                    └────────────────────────────────────┘
```

---

## Flow 1: Login / SSO

**Production domain:** `https://intel24.blackbox.codes`

| Entry Point | URL |
|-------------|-----|
| SSO (kanonisk) | `https://intel24.blackbox.codes/sso-login?sso=<JWT>` |
| Manuel login | `https://intel24.blackbox.codes/login` |

```text
User → Browser
    │
    ├─── Manual Login (/login)
    │       │
    │       └── LoginPage.tsx
    │               ├── Validate credentials (local demo users)
    │               └── onLoginSuccess → App.tsx → sessionStorage
    │
    └─── SSO Login (/sso-login?sso=<JWT>)
            │
            └── SsoLoginPage.tsx
                    ├── Verify JWT (jose library, HS256)
                    ├── Success → sessionStorage → Dashboard (/)
                    └── Failure → /login with ssoFailed=true banner
```

**Key files:**

- `src/components/Auth/LoginPage.tsx`
- `src/components/Auth/SsoLoginPage.tsx`
- `src/domains/auth/sso.ts` (token verification)
- `src/App.tsx` (auth state, LoginRoute)
- `server/app.ts` (`/api/health`, `/api/auth/sso-health`)

**Docs:** [ts24_login_flow.md](ts24_login_flow.md), [sso_v1_signoff_ts24.md](sso_v1_signoff_ts24.md), [ts24_dns_and_cert_ops.md](ts24_dns_and_cert_ops.md) (DNS/cert ops-runbook)

**External monitor hook:** `/api/health` can be polled by ops to verify that DNS + TLS + SPA are live before enabling SSO.

---

## Flow 2: Case Loading

```text
App.tsx (authenticated)
    │
    ├── URL: ?case=tsl
    │
    └── DataProvider (DataContext.tsx)
            │
            ├── 1. Try fetchCase(caseId) from API
            │       └── GET /api/cases/:id
            │
            ├── 2. On success → dataSource = 'api'
            │
            └── 3. On failure → fallback to getDataForSubject()
                    └── dataSource = 'mock'
```

**Key files:**

- `src/context/DataContext.tsx`
- `src/domains/api/client.ts` (`fetchCase`, `fetchCases`)
- `src/domains/cases/caseStore.ts`
- `src/components/Cases/CaseLibraryView.tsx`

**Docs:** [cases_api.md](cases_api.md)

---

## Flow 3: Events & Timeline

```text
DataProvider
    │
    ├── 1. Try fetchCaseEvents(caseId)
    │       └── GET /api/cases/:id/events
    │
    ├── 2. On success → eventsSource = 'api'
    │
    └── 3. On failure → deriveEventsFromCaseData()
            └── eventsSource = 'derived'

CaseTimeline.tsx
    │
    └── Renders events grouped by day with severity badges
```

**Key files:**

- `src/domains/events/caseEvents.ts`
- `src/components/Cases/CaseTimeline.tsx`
- `server/app.ts` (`GET /api/cases/:id/events`)

**Docs:** [events_timeline.md](events_timeline.md)

---

## Flow 4: KPI Dashboard

```text
DataProvider
    │
    ├── 1. Try fetchCaseKpis(caseId)
    │       └── GET /api/cases/:id/kpis
    │
    ├── 2. On success → kpisSource = 'api'
    │
    └── 3. On failure → deriveKpisFromCaseData()
            └── kpisSource = 'derived'

ExecutiveSummaryView.tsx
    │
    └── Renders KPI cards with severity, trend, hints
```

**Key files:**

- `src/domains/kpi/caseKpis.ts`
- `src/components/Executive/ExecutiveSummaryView.tsx`
- `server/app.ts` (`GET /api/cases/:id/kpis`)

**Docs:** [kpi_module.md](kpi_module.md)

---

## Flow 5: Executive PDF Export

```text
ExecutiveSummaryView → handleExport()
    │
    └── executiveExportService.ts
            │
            ├── 1. Capture chart snapshots (html2canvas)
            │
            ├── 2. Build metadata (buildExecutiveReportMetadata)
            │
            └── 3. Generate PDF (generateExecutiveReportPdf)
                    │
                    ├── Run section pipeline (6 sections)
                    ├── Apply header/footer (post-render)
                    └── Save with filename: <CASE>_ExecutiveSummary_<ver>_<date>.pdf
```

**Key files:**

- `src/domains/executive/services/executiveExportService.ts`
- `src/pdf/executiveReport.ts`
- `src/pdf/sections/*.ts`
- `src/pdf/reportHeader.ts`, `reportFooter.ts`

**Docs:** [export_module.md](export_module.md)

---

## Domain Structure

| Domain | Location | Responsibility |
|--------|----------|----------------|
| Auth | `src/components/Auth/` | Login, SSO, access requests |
| Cases | `src/domains/cases/` | Case store, metadata |
| Events | `src/domains/events/` | Event derivation, types |
| KPI | `src/domains/kpi/` | KPI derivation, metrics |
| Export | `src/domains/export/` | JSON export payload |
| Executive | `src/domains/executive/` | Executive summary, PDF export service |
| Tenant | `src/domains/tenant/` | Tenant context, AI key management |
| API | `src/domains/api/` | HTTP client for backend calls |

---

## API Summary

| Endpoint | Method | Description | Docs |
|----------|--------|-------------|------|
| `/api/auth/sso-health` | GET | SSO configuration status | [sso_v1_signoff_ts24.md](sso_v1_signoff_ts24.md) |
| `/api/cases` | GET | List all cases | [cases_api.md](cases_api.md) |
| `/api/cases/:id` | GET | Get full case data | [cases_api.md](cases_api.md) |
| `/api/cases/:id/events` | GET | Get case events | [events_timeline.md](events_timeline.md) |
| `/api/cases/:id/kpis` | GET | Get case KPIs | [kpi_module.md](kpi_module.md) |
| `/api/cases/:id/export` | POST | Export case payload | [export_module.md](export_module.md) |
| `/api/tenant/:id/aiKey` | GET/PUT/DELETE | Tenant AI key management | README.md |

---

## Related Documentation

- [README.md](../README.md) – Project overview and getting started
- [ts24_login_flow.md](ts24_login_flow.md) – Login and SSO implementation details
- [sso_v1_signoff_ts24.md](sso_v1_signoff_ts24.md) – SSO v1 sign-off checklist
- [cases_api.md](cases_api.md) – Case API and DataContext
- [events_timeline.md](events_timeline.md) – Event engine and CaseTimeline
- [kpi_module.md](kpi_module.md) – KPI derivation and dashboard
- [export_module.md](export_module.md) – Export pipeline and Executive PDF

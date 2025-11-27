# TSL Intelligence Console

This repository contains the TSL Intelligence Console — a multi-tenant React + Vite application for investigations, network analysis and reporting. It includes support for AI overlays on networks, tenant‑scoped AI keys (server‑side encrypted), a pluggable events engine, KPI modules, export pipelines and rebranding-ready UI work.

## High-level architecture

- **Frontend:** React + Vite app in `src/` with modular components (Dashboard, NetworkGraph, Executive, Settings, etc.).
- **AI integration:** client-side adapters in `src/lib/ai` and a network analysis service in `src/domains/network/services/aiNetworkAnalysisService.ts` which caches results and exposes a pub/sub interface.
- **Tenant & RBAC:** central `TenantProvider` supplies tenant information and permissions. UI respects `ai:use` (consume overlays) and `ai:configure` (manage tenant key).
- **Server (local/dev):** a lightweight Express service in `server/` provides encrypted storage for tenant AI keys (`/api/tenant/:id/aiKey`). AES‑256‑GCM encryption is used; master key comes from `process.env.AI_KEY_MASTER`.
- **Export module (planned):** modular export pipeline for PDF/Excel/CSV/JSON under `src/domains/export/` (Del 8).

## Quickstart (development)

Prerequisites: Node.js 16+ and Git.

1. Install dependencies:

```pwsh
npm install
```

2. Environment variables

Create a `.env.local` (or set env vars) with at least the following keys:

```
VITE_GEMINI_API_KEY=your_gemini_key_here
AI_KEY_MASTER=<base64-encoded-32-byte-master-key>
```

Notes:
- `AI_KEY_MASTER` must be a 32‑byte key encoded in base64. Use a proper secret manager (KMS, HashiCorp Vault, Azure Key Vault) in production — do not check secrets into source control.
- The frontend will fetch/store tenant AI keys only via the server API; it does not persist keys in `localStorage`.

3. Run locally

- Start the frontend (Vite):

```pwsh
npm run dev
```

- Start the local AI-key service (optional, used by `AiKeySettings`):

```pwsh
node ./server/index.js
# or with tsx for TS: npx tsx server/index.ts
```

4. Build and test

```pwsh
npm run build
npm test
```

## Tenant AI key API

Routes (example server implementation in `server/`):

- `GET /api/tenant/:id/aiKey` — returns `{ exists: boolean }`. Requires `ai:configure` permission.
- `PUT /api/tenant/:id/aiKey` — body `{ aiKey: string | null }`. Stores (or deletes) encrypted key. Requires `ai:configure`.

The provided `server/` implementation uses a simple JSON file for storage and reads `x-user-permissions` header to simulate RBAC in development/testing. Replace this with your real auth integration in production.

## New modules (summary)

- `src/domains/network/services/aiNetworkAnalysisService.ts`: analysis + cache + pub/sub.
- `src/components/Person/NetworkGraph.tsx`: AI overlay UI (toggle, sensitivity, category filters) and visuals.
- `src/domains/tenant/TenantContext.tsx`: tenant state, `aiKey?: string | null`, `updateAiKey` and `useOptionalTenant`.
- `src/components/Settings/AiKeySettings.tsx`: frontend integration to call server API (never stores keys client‑side).

## Testing

- Unit tests: Vitest

```pwsh
npm test
```

- Server integration tests: Supertest + Vitest (see `server/__tests__/aiKeyApi.test.ts`).

- Playwright (e2e): scaffolded Playwright tests (API-level RBAC checks) are included. To run Playwright tests and install browsers:

```pwsh
npm i -D @playwright/test playwright
npx playwright install --with-deps
npm run test:e2e
```

Full browser UI e2e tests (AI toggle visibility, overlay rendering) are planned next; they require the frontend dev server to be running during the tests and will be added to CI when stable.

## PR & CI guidance

- Ensure `npm run build` and `npm test` pass on your branch.
- Security PR (`chore(security): add server-side encrypted tenant AI key API`) includes server code, server tests and the frontend change to `AiKeySettings`.

## Next steps I can take for you

- Open or update the PR for the server API so it's ready for review.
- Add full Playwright browser UI tests for AI toggle/overlay flows.
- Start the export refactor (Del 8) on a new feature branch and scaffold `src/domains/export/`.


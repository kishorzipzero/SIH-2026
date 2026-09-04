# LabelCheck (SIH26034)

[![GitHub](https://img.shields.io/badge/GitHub-kishorzipzero%2FSIH--2026-181717?logo=github&logoColor=white)](https://github.com/kishorzipzero/SIH-2026)

Scan-and-verify compliance checker for the Legal Metrology (Packaged Commodities)
Rules, 2011, Rule 6 mandatory label declarations. A photo of a product label is
OCR'd and checked field-by-field against the checklist; every result is tagged
pass / fail / unclear with the specific clause it maps to.

## Stack

- **Backend** — Node.js + Express + TypeScript, `tesseract.js` for OCR
  (English + Hindi, runs locally, no API key required), `better-sqlite3` for
  storing users/scans and building violation reports, JWT auth (`jsonwebtoken`
  + `bcryptjs`).
- **Frontend** — React + TypeScript + Vite + Tailwind CSS + Framer Motion,
  routed with `react-router-dom`. A public landing page, login/register, and
  two role-gated dashboards: **Manufacturer** (pre-market self-check + scan
  history/stats) and **Inspector** (batch shelf scan + CSV violation report).

## Auth model

Accounts pick a role at registration — `manufacturer` or `inspector` — which
is baked into their JWT and used server-side to route every scan into the
right mode (a manufacturer's uploads can never write into another user's
inspector violation log). All scan/report endpoints require
`Authorization: Bearer <token>` and are scoped to the authenticated user.
`JWT_SECRET` has a dev fallback in `backend/src/auth/jwt.ts` — set a real one
via environment variable before deploying anywhere real.

## Running locally

```bash
npm install          # installs both workspaces
npm run dev:backend  # http://localhost:4000
npm run dev:frontend # http://localhost:5173 (proxies /api to :4000)
```

Open http://localhost:5173, allow camera/file access, and scan a label photo.
The first OCR request downloads Tesseract's English + Hindi language data
(~15 MB combined) — that requires internet access once; after that it's cached.

## What the rules engine actually checks

See `backend/src/rules/checklist.ts` for the full list. Each entry has a
`clauseRef` — these are **indicative** working references to Rule 6 for MVP
triage, not certified legal citations. Verify exact sub-clause lettering
against the official Gazette notification before using this for enforcement
or legal filings.

## Known limitations (stated deliberately, not hidden)

- **OCR accuracy** — low-quality, curved, or partially obscured label photos
  will produce low-confidence or missed extractions. The engine reports
  `unclear` rather than guessing when confidence is too low to trust.
- **MRP font-size check** — Rule 6 requires a minimum MRP text height in mm
  that scales with package size. We cannot recover real-world mm from an
  uncalibrated phone photo, so `backend/src/rules/fontSizeHeuristic.ts`
  compares MRP text height only *relative* to the rest of the label. A
  production version needs a calibration reference (coin/ruler in frame) to
  do true mm measurement.
- **Common/generic name extraction** — detecting the product's generic name
  from raw OCR text alone (without product-category context) is unreliable;
  this field is always flagged for manual confirmation rather than silently
  trusted.
- **Multilingual OCR** — English + Hindi only at this stage. Regional
  language support is a roadmap item, not implemented.
- **No automatic penalty calculation or e-filing** — the Inspector mode
  produces a violation report (viewable + CSV export); it does not submit
  anything to any authority. That would be a real architecture extension,
  not something to fake here.

## Project layout

```
backend/
  src/ocr/extractText.ts       OCR wrapper (tesseract.js)
  src/rules/checklist.ts       Rule 6 checklist definitions + extraction regexes
  src/rules/fontSizeHeuristic.ts  Relative MRP font-size heuristic
  src/rules/engine.ts          Runs checklist against OCR output -> pass/fail/unclear
  src/auth/jwt.ts              JWT sign/verify
  src/middleware/auth.ts       requireAuth / requireRole middleware
  src/routes/auth.ts           POST /api/auth/register, /login, GET /me
  src/routes/scan.ts           POST /api/scan (auth required)
  src/routes/reports.ts        GET /api/reports, /stats, /violations (auth required, user-scoped)
  src/db.ts                    SQLite schema/connection (users, scans)
frontend/
  src/context/AuthContext.tsx      Auth state, login/register/logout
  src/pages/Landing.tsx            Public marketing page
  src/pages/Login.tsx, Register.tsx
  src/pages/ManufacturerDashboard.tsx  Stats + self-check form + scan history
  src/pages/InspectorDashboard.tsx     Stats + batch-scan panel
  src/components/ScanForm.tsx      Shared scan widget (used by both dashboards)
  src/components/BatchScanPanel.tsx  Inspector batch log + violation report + CSV export
  src/components/ResultsScreen.tsx   Per-field pass/fail/unclear results screen
  src/components/ProtectedRoute.tsx  Role-gated route wrapper
```

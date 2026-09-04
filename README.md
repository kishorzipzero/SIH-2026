# LabelCheck (SIH26034)

Scan-and-verify compliance checker for the Legal Metrology (Packaged Commodities)
Rules, 2011, Rule 6 mandatory label declarations. A photo of a product label is
OCR'd and checked field-by-field against the checklist; every result is tagged
pass / fail / unclear with the specific clause it maps to.

## Stack

- **Backend** — Node.js + Express + TypeScript, `tesseract.js` for OCR
  (English + Hindi, runs locally, no API key required), `better-sqlite3` for
  storing scans and building violation reports.
- **Frontend** — React + TypeScript + Vite + Tailwind CSS. Two modes:
  Self-Check (single product, pre-market) and Inspector (batch scan + CSV
  violation report export).

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
  src/routes/scan.ts           POST /api/scan
  src/routes/reports.ts        GET /api/reports, /api/reports/violations
  src/db.ts                    SQLite schema/connection
frontend/
  src/components/SelfCheckView.tsx     Manufacturer/packer self-check mode
  src/components/InspectorDashboard.tsx Batch scan + violation report + CSV export
  src/components/ResultsScreen.tsx     Per-field pass/fail/unclear results screen
```

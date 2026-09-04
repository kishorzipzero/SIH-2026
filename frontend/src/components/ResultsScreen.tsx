import { FieldResult, ScanResponse } from "../types";

const STATUS_STYLE: Record<string, string> = {
  pass: "bg-green-50 border-green-300 text-green-800",
  fail: "bg-red-50 border-red-300 text-red-800",
  unclear: "bg-amber-50 border-amber-300 text-amber-800",
};

const STATUS_LABEL: Record<string, string> = {
  pass: "PASS",
  fail: "FAIL",
  unclear: "UNCLEAR",
};

function FieldCard({ field }: { field: FieldResult }) {
  if (!field.applicable) {
    return (
      <div className="rounded border border-slate-200 bg-slate-50 p-3 text-sm text-slate-500">
        <div className="flex items-center justify-between">
          <span className="font-medium">{field.label}</span>
          <span className="rounded-full bg-slate-200 px-2 py-0.5 text-xs">N/A</span>
        </div>
        <div className="mt-1 text-xs">{field.clauseRef}</div>
      </div>
    );
  }

  return (
    <div className={`rounded border p-3 text-sm ${STATUS_STYLE[field.status]}`}>
      <div className="flex items-center justify-between gap-2">
        <span className="font-medium">{field.label}</span>
        <span className="shrink-0 rounded-full border border-current px-2 py-0.5 text-xs font-semibold">
          {STATUS_LABEL[field.status]}
        </span>
      </div>
      <div className="mt-1 text-xs opacity-80">{field.clauseRef}</div>
      {field.extractedValue && (
        <div className="mt-2 rounded bg-white/60 px-2 py-1 font-mono text-xs">
          "{field.extractedValue}"
          {field.confidence !== null && (
            <span className="ml-2 opacity-70">({Math.round(field.confidence)}% OCR conf.)</span>
          )}
        </div>
      )}
      {field.note && <div className="mt-1 text-xs italic opacity-80">{field.note}</div>}
    </div>
  );
}

export function ResultsScreen({ result }: { result: ScanResponse }) {
  const { summary, fields, overallConfidence } = result;
  return (
    <div className="flex flex-col gap-4">
      <div className="flex flex-wrap items-center gap-3 rounded border border-slate-200 bg-white p-3 text-sm">
        <span className="font-semibold">Scan confidence: {Math.round(overallConfidence)}%</span>
        <span className="rounded-full bg-green-100 px-2 py-0.5 text-green-800">
          {summary.pass} pass
        </span>
        <span className="rounded-full bg-red-100 px-2 py-0.5 text-red-800">
          {summary.fail} fail
        </span>
        <span className="rounded-full bg-amber-100 px-2 py-0.5 text-amber-800">
          {summary.unclear} unclear
        </span>
        <span className="rounded-full bg-slate-100 px-2 py-0.5 text-slate-600">
          {summary.notApplicable} n/a
        </span>
      </div>

      {overallConfidence < 55 && (
        <div className="rounded border border-amber-300 bg-amber-50 p-3 text-xs text-amber-800">
          Overall OCR confidence is low. Photo may be blurry, curved, or poorly lit —
          "unclear" results below should be verified manually rather than treated as
          confirmed violations.
        </div>
      )}

      <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
        {fields.map((f) => (
          <FieldCard key={f.id} field={f} />
        ))}
      </div>

      <p className="text-xs text-slate-400">
        Clause references are indicative mappings to Legal Metrology (Packaged
        Commodities) Rules, 2011, Rule 6, for MVP triage — verify exact sub-clause
        text against the official Gazette notification before use in enforcement or
        legal filings. MRP font-size check is a relative heuristic, not an
        mm-calibrated measurement.
      </p>
    </div>
  );
}

import { motion } from "framer-motion";
import { FieldResult, ScanResponse } from "../types";

const STATUS_STYLE: Record<string, string> = {
  pass: "bg-green-50 border-green-200 text-green-800",
  fail: "bg-red-50 border-red-200 text-red-800",
  unclear: "bg-amber-50 border-amber-200 text-amber-800",
};

const STATUS_LABEL: Record<string, string> = {
  pass: "PASS",
  fail: "FAIL",
  unclear: "UNCLEAR",
};

const container = {
  hidden: {},
  show: { transition: { staggerChildren: 0.05 } },
};
const item = {
  hidden: { opacity: 0, y: 10 },
  show: { opacity: 1, y: 0 },
};

function FieldCard({ field }: { field: FieldResult }) {
  if (!field.applicable) {
    return (
      <motion.div
        variants={item}
        className="rounded-xl border border-ink-100 bg-ink-50 p-3 text-sm text-ink-400"
      >
        <div className="flex items-center justify-between">
          <span className="font-medium">{field.label}</span>
          <span className="rounded-full bg-ink-100 px-2 py-0.5 text-xs">N/A</span>
        </div>
        <div className="mt-1 text-xs">{field.clauseRef}</div>
      </motion.div>
    );
  }

  return (
    <motion.div
      variants={item}
      whileHover={{ y: -2 }}
      className={`rounded-xl border p-3.5 text-sm shadow-sm ${STATUS_STYLE[field.status]}`}
    >
      <div className="flex items-center justify-between gap-2">
        <span className="font-medium">{field.label}</span>
        <span className="shrink-0 rounded-full border border-current px-2 py-0.5 text-xs font-semibold">
          {STATUS_LABEL[field.status]}
        </span>
      </div>
      <div className="mt-1 text-xs opacity-80">{field.clauseRef}</div>
      {field.extractedValue && (
        <div className="mt-2 rounded-lg bg-white/60 px-2 py-1 font-mono text-xs">
          "{field.extractedValue}"
          {field.confidence !== null && (
            <span className="ml-2 opacity-70">({Math.round(field.confidence)}% OCR conf.)</span>
          )}
        </div>
      )}
      {field.note && <div className="mt-1 text-xs italic opacity-80">{field.note}</div>}
    </motion.div>
  );
}

export function ResultsScreen({ result }: { result: ScanResponse }) {
  const { summary, fields, overallConfidence } = result;
  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      className="flex flex-col gap-4"
    >
      <div className="flex flex-wrap items-center gap-2 rounded-xl border border-ink-100 bg-white p-3.5 text-sm shadow-soft">
        <span className="font-semibold text-ink-800">
          Scan confidence: {Math.round(overallConfidence)}%
        </span>
        <span className="rounded-full bg-green-100 px-2.5 py-0.5 text-green-800">
          {summary.pass} pass
        </span>
        <span className="rounded-full bg-red-100 px-2.5 py-0.5 text-red-800">
          {summary.fail} fail
        </span>
        <span className="rounded-full bg-amber-100 px-2.5 py-0.5 text-amber-800">
          {summary.unclear} unclear
        </span>
        <span className="rounded-full bg-ink-100 px-2.5 py-0.5 text-ink-600">
          {summary.notApplicable} n/a
        </span>
      </div>

      {overallConfidence < 55 && (
        <div className="rounded-xl border border-amber-200 bg-amber-50 p-3 text-xs text-amber-800">
          Overall OCR confidence is low. Photo may be blurry, curved, or poorly lit —
          "unclear" results below should be verified manually rather than treated as
          confirmed violations.
        </div>
      )}

      <motion.div
        variants={container}
        initial="hidden"
        animate="show"
        className="grid grid-cols-1 gap-2.5 sm:grid-cols-2"
      >
        {fields.map((f) => (
          <FieldCard key={f.id} field={f} />
        ))}
      </motion.div>

      <p className="text-xs text-ink-400">
        Clause references are indicative mappings to Legal Metrology (Packaged
        Commodities) Rules, 2011, Rule 6, for MVP triage — verify exact sub-clause
        text against the official Gazette notification before use in enforcement or
        legal filings. MRP font-size check is a relative heuristic, not an
        mm-calibrated measurement.
      </p>
    </motion.div>
  );
}

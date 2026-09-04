import { motion } from "framer-motion";
import { InspectionResponse } from "../types";

export function InspectionResultsView({ result }: { result: InspectionResponse }) {
  const isConsistent = result.verdict === "consistent";

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      className="flex flex-col gap-4"
    >
      <div
        className={`flex items-center gap-3 rounded-xl border p-4 shadow-soft ${
          isConsistent
            ? "border-green-200 bg-green-50 text-green-800"
            : "border-amber-200 bg-amber-50 text-amber-800"
        }`}
      >
        <span className="text-2xl">{isConsistent ? "✅" : "⚠️"}</span>
        <div>
          <div className="font-display font-semibold">
            {isConsistent ? "Consistent across all sides" : "Review needed — variation detected"}
          </div>
          <div className="text-xs opacity-80">
            {result.angles.length} angle{result.angles.length === 1 ? "" : "s"} compared
            {result.productName ? ` · ${result.productName}` : ""}
          </div>
        </div>
      </div>

      {result.discrepancies.length > 0 && (
        <div className="rounded-xl border border-red-200 bg-red-50 p-4">
          <h4 className="mb-2 text-sm font-semibold text-red-800">
            Description / quantity discrepancies between sides
          </h4>
          <div className="flex flex-col gap-3">
            {result.discrepancies.map((d) => (
              <div key={d.fieldId} className="rounded-lg bg-white/70 p-3 text-sm">
                <div className="font-medium text-red-800">
                  {d.label} <span className="font-normal text-red-600">({d.clauseRef})</span>
                </div>
                <ul className="mt-1.5 flex flex-col gap-1">
                  {d.valuesByAngle.map((v) => (
                    <li key={v.angle} className="flex items-center gap-2 text-xs text-ink-700">
                      <span className="w-24 shrink-0 rounded-full bg-red-100 px-2 py-0.5 text-center font-medium text-red-700">
                        {v.angle.replace("_", " ")}
                      </span>
                      <span className="font-mono">"{v.rawValue}"</span>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>
      )}

      {result.qualityFlags.length > 0 && (
        <div className="rounded-xl border border-amber-200 bg-amber-50 p-4">
          <h4 className="mb-2 text-sm font-semibold text-amber-800">
            Visual quality differences between sides
          </h4>
          <ul className="flex flex-col gap-1.5">
            {result.qualityFlags.map((f) => (
              <li key={f.angle} className="text-sm text-amber-800">
                <span className="font-medium capitalize">{f.angle.replace("_", " ")}:</span> {f.reason}
              </li>
            ))}
          </ul>
          <p className="mt-2 text-xs italic text-amber-700">
            Heuristic based on brightness/contrast relative to the other sides — not forensic
            proof. Always confirm visually before treating this as a finding.
          </p>
        </div>
      )}

      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        {result.angles.map((a) => (
          <div key={a.angle} className="rounded-xl border border-ink-100 bg-white p-3 shadow-soft">
            <img
              src={`/uploads/${a.imagePath}`}
              alt={a.label}
              className="mb-2 aspect-square w-full rounded-lg object-cover"
            />
            <div className="text-xs font-semibold text-ink-800">{a.label}</div>
            <div className="mt-1 flex gap-1 text-[11px]">
              <span className="rounded-full bg-green-100 px-1.5 py-0.5 text-green-800">
                {a.summary.pass}
              </span>
              <span className="rounded-full bg-red-100 px-1.5 py-0.5 text-red-800">
                {a.summary.fail}
              </span>
              <span className="rounded-full bg-amber-100 px-1.5 py-0.5 text-amber-800">
                {a.summary.unclear}
              </span>
            </div>
          </div>
        ))}
      </div>

      <p className="text-xs text-ink-400">
        Discrepancy detection compares OCR-extracted values across the sides you photographed;
        it can only compare what OCR actually read, so a low-confidence angle may under-report
        real differences. Quality flags are a brightness/contrast heuristic, not a defect
        certification.
      </p>
    </motion.div>
  );
}

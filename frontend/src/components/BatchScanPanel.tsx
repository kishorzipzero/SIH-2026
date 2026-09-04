import { AnimatePresence, motion } from "framer-motion";
import { useState } from "react";
import { fetchViolations } from "../api";
import { ScanResponse, StoredScan } from "../types";
import { ScanForm } from "./ScanForm";

function toCsv(rows: StoredScan[]): string {
  const header = ["Scan ID", "Product", "Category", "Origin", "Field", "Clause", "Status", "Extracted Value"];
  const lines = [header.join(",")];
  for (const scan of rows) {
    for (const f of scan.fields) {
      lines.push(
        [
          scan.scanId,
          scan.productName ?? "",
          scan.productContext.category,
          scan.productContext.origin,
          f.label,
          f.clauseRef,
          f.status,
          f.extractedValue ?? "",
        ]
          .map((v) => `"${String(v).replace(/"/g, '""')}"`)
          .join(",")
      );
    }
  }
  return lines.join("\n");
}

function downloadCsv(csv: string, filename: string) {
  const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  a.remove();
  URL.revokeObjectURL(url);
}

export function BatchScanPanel({ onScan }: { onScan?: () => void }) {
  const [batchId] = useState(() => `batch-${Date.now()}`);
  const [batchResults, setBatchResults] = useState<ScanResponse[]>([]);
  const [violations, setViolations] = useState<StoredScan[] | null>(null);

  function handleScanComplete(res: ScanResponse) {
    setBatchResults((prev) => [res, ...prev]);
    onScan?.();
  }

  async function handleViewReport() {
    const rows = await fetchViolations(batchId);
    setViolations(rows);
  }

  return (
    <div className="flex flex-col gap-5">
      <div className="flex items-center justify-between rounded-xl border border-ink-100 bg-white px-4 py-2.5 shadow-soft">
        <span className="text-sm font-medium text-ink-700">Current shelf batch</span>
        <span className="rounded-full bg-ink-100 px-2.5 py-1 font-mono text-xs text-ink-500">
          {batchId}
        </span>
      </div>

      <ScanForm
        title="Batch scan — shelf inspection"
        subtitle="Scan each product on the shelf; results are logged to this batch automatically."
        productNameLabel="Product / shelf location"
        productNamePlaceholder="e.g. Aisle 3 - Cooking Oil 1L"
        submitLabel="Scan & add to batch"
        batchId={batchId}
        onScanComplete={handleScanComplete}
      />

      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        className="rounded-2xl border border-ink-100 bg-white p-5 shadow-soft"
      >
        <div className="mb-3 flex items-center justify-between">
          <h3 className="font-display text-sm font-semibold text-ink-800">
            Batch log ({batchResults.length} scanned)
          </h3>
          <div className="flex gap-2">
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={handleViewReport}
              className="rounded-lg border border-ink-200 px-3 py-1.5 text-xs font-medium text-ink-700 hover:border-brand-300"
            >
              Refresh violation report
            </motion.button>
            {violations && violations.length > 0 && (
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => downloadCsv(toCsv(violations), `${batchId}-violations.csv`)}
                className="rounded-lg bg-brand-gradient px-3 py-1.5 text-xs font-semibold text-white shadow-glow"
              >
                Export CSV
              </motion.button>
            )}
          </div>
        </div>

        {batchResults.length === 0 ? (
          <p className="text-sm text-ink-400">No scans yet in this batch.</p>
        ) : (
          <table className="w-full text-left text-sm">
            <thead>
              <tr className="border-b border-ink-100 text-xs uppercase text-ink-400">
                <th className="py-1.5">Scan</th>
                <th className="py-1.5">Pass</th>
                <th className="py-1.5">Fail</th>
                <th className="py-1.5">Unclear</th>
              </tr>
            </thead>
            <tbody>
              <AnimatePresence initial={false}>
                {batchResults.map((r) => (
                  <motion.tr
                    key={r.scanId}
                    initial={{ opacity: 0, x: -8 }}
                    animate={{ opacity: 1, x: 0 }}
                    className="border-b border-ink-50"
                  >
                    <td className="py-1.5 font-mono text-xs">{r.scanId.slice(0, 8)}</td>
                    <td className="py-1.5 text-green-700">{r.summary.pass}</td>
                    <td className="py-1.5 text-red-700">{r.summary.fail}</td>
                    <td className="py-1.5 text-amber-700">{r.summary.unclear}</td>
                  </motion.tr>
                ))}
              </AnimatePresence>
            </tbody>
          </table>
        )}

        {violations && (
          <div className="mt-4 border-t border-ink-100 pt-3">
            <h4 className="mb-2 text-xs font-semibold uppercase text-ink-500">
              Violation Report ({violations.length} product{violations.length === 1 ? "" : "s"} with issues)
            </h4>
            {violations.length === 0 ? (
              <p className="text-sm text-green-700">No outstanding violations in this batch.</p>
            ) : (
              <div className="flex flex-col gap-3">
                {violations.map((scan) => (
                  <div key={scan.scanId} className="rounded-xl border border-red-200 bg-red-50 p-3">
                    <div className="mb-1 text-sm font-medium text-ink-800">
                      {scan.productName || scan.scanId.slice(0, 8)}
                    </div>
                    <ul className="list-inside list-disc text-xs text-red-800">
                      {scan.fields.map((f) => (
                        <li key={f.id}>
                          {f.label} ({f.clauseRef}) — {f.status.toUpperCase()}
                        </li>
                      ))}
                    </ul>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </motion.div>
    </div>
  );
}

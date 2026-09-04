import { useState } from "react";
import { fetchViolations, submitScan } from "../api";
import { ProductContext, ScanResponse, StoredScan } from "../types";
import { CategorySelector } from "./CategorySelector";
import { ImageCapture } from "./ImageCapture";
import { ResultsScreen } from "./ResultsScreen";

const DEFAULT_CONTEXT: ProductContext = {
  category: "non-food",
  origin: "domestic",
  perishable: false,
  hasUnitSalePrice: false,
};

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

export function InspectorDashboard() {
  const [batchId] = useState(() => `batch-${Date.now()}`);
  const [context, setContext] = useState<ProductContext>(DEFAULT_CONTEXT);
  const [file, setFile] = useState<File | null>(null);
  const [productName, setProductName] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [latest, setLatest] = useState<ScanResponse | null>(null);
  const [batchResults, setBatchResults] = useState<ScanResponse[]>([]);
  const [violations, setViolations] = useState<StoredScan[] | null>(null);

  async function handleSubmit() {
    if (!file) {
      setError("Please choose or capture a label photo first.");
      return;
    }
    setLoading(true);
    setError(null);
    try {
      const res = await submitScan({
        file,
        mode: "inspector",
        batchId,
        productName,
        context,
      });
      setLatest(res);
      setBatchResults((prev) => [res, ...prev]);
      setProductName("");
      setFile(null);
    } catch (e) {
      setError((e as Error).message);
    } finally {
      setLoading(false);
    }
  }

  async function handleViewReport() {
    const rows = await fetchViolations(batchId);
    setViolations(rows);
  }

  return (
    <div className="flex flex-col gap-5">
      <div className="rounded-lg border border-slate-200 bg-white p-4">
        <div className="mb-3 flex items-center justify-between">
          <h2 className="text-lg font-semibold">Batch scan — shelf inspection</h2>
          <span className="rounded bg-slate-100 px-2 py-1 font-mono text-xs text-slate-500">
            {batchId}
          </span>
        </div>
        <div className="flex flex-col gap-3">
          <label className="flex flex-col gap-1 text-sm">
            <span className="font-medium text-slate-700">Product name</span>
            <input
              className="rounded border border-slate-300 px-2 py-1.5"
              value={productName}
              onChange={(e) => setProductName(e.target.value)}
              placeholder="e.g. Aisle 3 - Cooking Oil 1L"
            />
          </label>
          <CategorySelector value={context} onChange={setContext} />
          <ImageCapture onFileSelected={setFile} />
          <button
            onClick={handleSubmit}
            disabled={loading}
            className="rounded bg-slate-900 px-4 py-2 text-sm font-medium text-white disabled:opacity-50"
          >
            {loading ? "Scanning..." : "Scan & add to batch"}
          </button>
          {error && <div className="text-sm text-red-600">{error}</div>}
        </div>
      </div>

      {latest && (
        <div>
          <h3 className="mb-2 text-sm font-semibold text-slate-600">Latest scan result</h3>
          <ResultsScreen result={latest} />
        </div>
      )}

      <div className="rounded-lg border border-slate-200 bg-white p-4">
        <div className="mb-3 flex items-center justify-between">
          <h3 className="text-sm font-semibold">
            Batch log ({batchResults.length} scanned)
          </h3>
          <div className="flex gap-2">
            <button
              onClick={handleViewReport}
              className="rounded border border-slate-300 px-3 py-1.5 text-xs font-medium text-slate-700 hover:bg-slate-50"
            >
              Refresh violation report
            </button>
            {violations && violations.length > 0 && (
              <button
                onClick={() => downloadCsv(toCsv(violations), `${batchId}-violations.csv`)}
                className="rounded bg-slate-900 px-3 py-1.5 text-xs font-medium text-white"
              >
                Export CSV
              </button>
            )}
          </div>
        </div>

        {batchResults.length === 0 ? (
          <p className="text-sm text-slate-400">No scans yet in this batch.</p>
        ) : (
          <table className="w-full text-left text-sm">
            <thead>
              <tr className="border-b border-slate-200 text-xs uppercase text-slate-400">
                <th className="py-1.5">Product</th>
                <th className="py-1.5">Pass</th>
                <th className="py-1.5">Fail</th>
                <th className="py-1.5">Unclear</th>
              </tr>
            </thead>
            <tbody>
              {batchResults.map((r) => (
                <tr key={r.scanId} className="border-b border-slate-100">
                  <td className="py-1.5">{r.scanId.slice(0, 8)}</td>
                  <td className="py-1.5 text-green-700">{r.summary.pass}</td>
                  <td className="py-1.5 text-red-700">{r.summary.fail}</td>
                  <td className="py-1.5 text-amber-700">{r.summary.unclear}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}

        {violations && (
          <div className="mt-4 border-t border-slate-200 pt-3">
            <h4 className="mb-2 text-xs font-semibold uppercase text-slate-500">
              Violation Report ({violations.length} product{violations.length === 1 ? "" : "s"} with issues)
            </h4>
            {violations.length === 0 ? (
              <p className="text-sm text-green-700">No outstanding violations in this batch.</p>
            ) : (
              <div className="flex flex-col gap-3">
                {violations.map((scan) => (
                  <div key={scan.scanId} className="rounded border border-red-200 bg-red-50 p-3">
                    <div className="mb-1 text-sm font-medium">
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
      </div>
    </div>
  );
}

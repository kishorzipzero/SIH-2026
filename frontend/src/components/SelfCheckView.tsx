import { useState } from "react";
import { submitScan } from "../api";
import { ProductContext, ScanResponse } from "../types";
import { CategorySelector } from "./CategorySelector";
import { ImageCapture } from "./ImageCapture";
import { ResultsScreen } from "./ResultsScreen";

const DEFAULT_CONTEXT: ProductContext = {
  category: "non-food",
  origin: "domestic",
  perishable: false,
  hasUnitSalePrice: false,
};

export function SelfCheckView() {
  const [context, setContext] = useState<ProductContext>(DEFAULT_CONTEXT);
  const [file, setFile] = useState<File | null>(null);
  const [productName, setProductName] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<ScanResponse | null>(null);

  async function handleSubmit() {
    if (!file) {
      setError("Please choose or capture a label photo first.");
      return;
    }
    setLoading(true);
    setError(null);
    try {
      const res = await submitScan({ file, mode: "self-check", productName, context });
      setResult(res);
    } catch (e) {
      setError((e as Error).message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="flex flex-col gap-5">
      <div className="rounded-lg border border-slate-200 bg-white p-4">
        <h2 className="mb-3 text-lg font-semibold">Pre-market label check</h2>
        <div className="flex flex-col gap-3">
          <label className="flex flex-col gap-1 text-sm">
            <span className="font-medium text-slate-700">Product name (optional, for your records)</span>
            <input
              className="rounded border border-slate-300 px-2 py-1.5"
              value={productName}
              onChange={(e) => setProductName(e.target.value)}
              placeholder="e.g. Turmeric Powder 200g"
            />
          </label>
          <CategorySelector value={context} onChange={setContext} />
          <ImageCapture onFileSelected={setFile} />
          <button
            onClick={handleSubmit}
            disabled={loading}
            className="rounded bg-slate-900 px-4 py-2 text-sm font-medium text-white disabled:opacity-50"
          >
            {loading ? "Scanning..." : "Check compliance"}
          </button>
          {error && <div className="text-sm text-red-600">{error}</div>}
        </div>
      </div>

      {result && <ResultsScreen result={result} />}
    </div>
  );
}

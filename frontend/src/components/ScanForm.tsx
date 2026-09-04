import { motion } from "framer-motion";
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

interface Props {
  title: string;
  subtitle: string;
  productNameLabel?: string;
  productNamePlaceholder?: string;
  batchId?: string | null;
  submitLabel?: string;
  showResultInline?: boolean;
  onScanComplete?: (result: ScanResponse) => void;
}

export function ScanForm({
  title,
  subtitle,
  productNameLabel = "Product name (optional)",
  productNamePlaceholder = "e.g. Turmeric Powder 200g",
  batchId,
  submitLabel = "Check compliance",
  showResultInline = true,
  onScanComplete,
}: Props) {
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
      const res = await submitScan({ file, batchId, productName, context });
      setResult(res);
      onScanComplete?.(res);
      setFile(null);
      setProductName("");
    } catch (e) {
      setError((e as Error).message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="flex flex-col gap-5">
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        className="rounded-2xl border border-ink-100 bg-white p-5 shadow-soft"
      >
        <h2 className="font-display text-lg font-semibold text-ink-900">{title}</h2>
        <p className="mt-0.5 text-sm text-ink-500">{subtitle}</p>

        <div className="mt-4 flex flex-col gap-4">
          <label className="flex flex-col gap-1 text-sm">
            <span className="font-medium text-ink-700">{productNameLabel}</span>
            <input
              className="rounded-lg border border-ink-200 px-3 py-2 outline-none focus:border-brand-400 focus:ring-2 focus:ring-brand-100"
              value={productName}
              onChange={(e) => setProductName(e.target.value)}
              placeholder={productNamePlaceholder}
            />
          </label>
          <CategorySelector value={context} onChange={setContext} />
          <ImageCapture onFileSelected={setFile} />
          <motion.button
            whileHover={{ scale: 1.01 }}
            whileTap={{ scale: 0.99 }}
            onClick={handleSubmit}
            disabled={loading}
            className="rounded-lg bg-brand-gradient px-4 py-2.5 text-sm font-semibold text-white shadow-glow disabled:opacity-50"
          >
            {loading ? "Scanning..." : submitLabel}
          </motion.button>
          {error && <div className="text-sm text-red-600">{error}</div>}
        </div>
      </motion.div>

      {showResultInline && result && <ResultsScreen result={result} />}
    </div>
  );
}

import { motion } from "framer-motion";
import { useState } from "react";
import { submitInspection } from "../api";
import { ANGLES, ANGLE_LABELS, AngleId, InspectionResponse, ProductContext } from "../types";
import { AngleSlot } from "./AngleSlot";
import { CategorySelector } from "./CategorySelector";
import { InspectionResultsView } from "./InspectionResultsView";

const DEFAULT_CONTEXT: ProductContext = {
  category: "non-food",
  origin: "domestic",
  perishable: false,
  hasUnitSalePrice: false,
};

interface Props {
  onComplete?: (result: InspectionResponse) => void;
}

export function MultiAngleForm({ onComplete }: Props) {
  const [photos, setPhotos] = useState<Partial<Record<AngleId, File>>>({});
  const [productName, setProductName] = useState("");
  const [context, setContext] = useState<ProductContext>(DEFAULT_CONTEXT);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<InspectionResponse | null>(null);

  const filledCount = Object.values(photos).filter(Boolean).length;

  function setPhoto(angle: AngleId, file: File | null) {
    setPhotos((prev) => ({ ...prev, [angle]: file ?? undefined }));
  }

  async function handleSubmit() {
    if (filledCount < 2) {
      setError("Capture at least 2 sides to compare.");
      return;
    }
    setLoading(true);
    setError(null);
    try {
      const res = await submitInspection({ photos, productName, context });
      setResult(res);
      onComplete?.(res);
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
        <h2 className="font-display text-lg font-semibold text-ink-900">
          8-angle product inspection
        </h2>
        <p className="mt-0.5 text-sm text-ink-500">
          Photograph the package from every side. LabelCheck cross-checks the declared
          quantity, MRP, name, and dates between sides, and flags any side that looks
          visually inconsistent with the rest.
        </p>

        <div className="mt-4 grid grid-cols-4 gap-2.5 sm:gap-3">
          {ANGLES.map((angle) => (
            <AngleSlot
              key={angle}
              label={ANGLE_LABELS[angle]}
              onFileSelected={(file) => setPhoto(angle, file)}
            />
          ))}
        </div>

        <div className="mt-4 flex flex-col gap-4">
          <label className="flex flex-col gap-1 text-sm">
            <span className="font-medium text-ink-700">Product name (optional)</span>
            <input
              className="rounded-lg border border-ink-200 px-3 py-2 outline-none focus:border-brand-400 focus:ring-2 focus:ring-brand-100"
              value={productName}
              onChange={(e) => setProductName(e.target.value)}
              placeholder="e.g. Cooking Oil 1L — Shelf 4"
            />
          </label>
          <CategorySelector value={context} onChange={setContext} />

          <motion.button
            whileHover={{ scale: 1.01 }}
            whileTap={{ scale: 0.99 }}
            onClick={handleSubmit}
            disabled={loading || filledCount < 2}
            className="rounded-lg bg-brand-gradient px-4 py-2.5 text-sm font-semibold text-white shadow-glow disabled:opacity-50"
          >
            {loading
              ? "Analyzing all sides..."
              : `Analyze ${filledCount || ""} side${filledCount === 1 ? "" : "s"}`}
          </motion.button>
          {error && <div className="text-sm text-red-600">{error}</div>}
        </div>
      </motion.div>

      {result && <InspectionResultsView result={result} />}
    </div>
  );
}

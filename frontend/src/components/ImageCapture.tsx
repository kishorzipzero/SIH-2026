import { AnimatePresence, motion } from "framer-motion";
import { useRef, useState } from "react";

interface Props {
  onFileSelected: (file: File | null) => void;
}

export function ImageCapture({ onFileSelected }: Props) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);

  function handleChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0] ?? null;
    onFileSelected(file);
    setPreviewUrl(file ? URL.createObjectURL(file) : null);
  }

  return (
    <div className="flex flex-col gap-3">
      <button
        type="button"
        onClick={() => inputRef.current?.click()}
        className="flex flex-col items-center justify-center gap-2 rounded-xl border-2 border-dashed border-ink-200 bg-ink-50 px-4 py-8 text-center transition hover:border-brand-400 hover:bg-brand-50"
      >
        <span className="text-2xl">📷</span>
        <span className="text-sm font-medium text-ink-700">
          {previewUrl ? "Choose a different photo" : "Capture or upload a label photo"}
        </span>
        <span className="text-xs text-ink-400">JPG or PNG, up to 15MB</span>
      </button>
      <input
        ref={inputRef}
        type="file"
        accept="image/*"
        capture="environment"
        onChange={handleChange}
        className="hidden"
      />
      <AnimatePresence>
        {previewUrl && (
          <motion.img
            initial={{ opacity: 0, scale: 0.97 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0 }}
            src={previewUrl}
            alt="Label preview"
            className="max-h-64 rounded-xl border border-ink-200 object-contain shadow-soft"
          />
        )}
      </AnimatePresence>
    </div>
  );
}

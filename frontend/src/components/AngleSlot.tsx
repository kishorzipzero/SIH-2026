import { AnimatePresence, motion } from "framer-motion";
import { useRef, useState } from "react";

interface Props {
  label: string;
  onFileSelected: (file: File | null) => void;
}

export function AngleSlot({ label, onFileSelected }: Props) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);

  function handleChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0] ?? null;
    onFileSelected(file);
    setPreviewUrl(file ? URL.createObjectURL(file) : null);
  }

  return (
    <button
      type="button"
      onClick={() => inputRef.current?.click()}
      className={`relative flex aspect-square flex-col items-center justify-center gap-1.5 overflow-hidden rounded-xl border-2 border-dashed p-2 text-center transition ${
        previewUrl
          ? "border-brand-400 bg-brand-50"
          : "border-ink-200 bg-ink-50 hover:border-brand-400 hover:bg-brand-50"
      }`}
    >
      <input
        ref={inputRef}
        type="file"
        accept="image/*"
        capture="environment"
        onChange={handleChange}
        className="hidden"
      />
      <AnimatePresence mode="wait">
        {previewUrl ? (
          <motion.img
            key="preview"
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            src={previewUrl}
            alt={label}
            className="absolute inset-0 h-full w-full object-cover"
          />
        ) : (
          <motion.span key="icon" initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-xl">
            📷
          </motion.span>
        )}
      </AnimatePresence>
      <span
        className={`relative z-10 rounded-full px-2 py-0.5 text-[11px] font-semibold ${
          previewUrl ? "bg-white/85 text-ink-900" : "text-ink-600"
        }`}
      >
        {label}
      </span>
      {previewUrl && (
        <span className="absolute right-1.5 top-1.5 flex h-5 w-5 items-center justify-center rounded-full bg-emerald-500 text-xs text-white shadow">
          ✓
        </span>
      )}
    </button>
  );
}

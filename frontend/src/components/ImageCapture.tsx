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
    <div className="flex flex-col gap-2">
      <input
        ref={inputRef}
        type="file"
        accept="image/*"
        capture="environment"
        onChange={handleChange}
        className="text-sm"
      />
      {previewUrl && (
        <img
          src={previewUrl}
          alt="Label preview"
          className="max-h-64 rounded border border-slate-200 object-contain"
        />
      )}
    </div>
  );
}

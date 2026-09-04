type Mode = "self-check" | "inspector";

interface Props {
  mode: Mode;
  onChange: (mode: Mode) => void;
}

export function ModeSwitcher({ mode, onChange }: Props) {
  const tabs: { id: Mode; label: string; desc: string }[] = [
    { id: "self-check", label: "Self-Check", desc: "Manufacturer/packer pre-market check" },
    { id: "inspector", label: "Inspector", desc: "Batch scan + violation report log" },
  ];

  return (
    <div className="flex gap-2">
      {tabs.map((t) => (
        <button
          key={t.id}
          onClick={() => onChange(t.id)}
          className={`flex-1 rounded-lg border p-3 text-left transition ${
            mode === t.id
              ? "border-slate-900 bg-slate-900 text-white"
              : "border-slate-200 bg-white text-slate-700 hover:border-slate-400"
          }`}
        >
          <div className="font-semibold">{t.label}</div>
          <div className={`text-xs ${mode === t.id ? "text-slate-300" : "text-slate-500"}`}>
            {t.desc}
          </div>
        </button>
      ))}
    </div>
  );
}

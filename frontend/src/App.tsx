import { useState } from "react";
import { ModeSwitcher } from "./components/ModeSwitcher";
import { SelfCheckView } from "./components/SelfCheckView";
import { InspectorDashboard } from "./components/InspectorDashboard";

type Mode = "self-check" | "inspector";

export default function App() {
  const [mode, setMode] = useState<Mode>("self-check");

  return (
    <div className="min-h-screen bg-slate-50 pb-16">
      <header className="border-b border-slate-200 bg-white px-6 py-4">
        <h1 className="text-xl font-bold text-slate-900">LabelCheck</h1>
        <p className="text-sm text-slate-500">
          Legal Metrology (Packaged Commodities) Rules, 2011 — Rule 6 label compliance scanner
        </p>
      </header>

      <main className="mx-auto flex max-w-3xl flex-col gap-5 px-4 py-6">
        <ModeSwitcher mode={mode} onChange={setMode} />
        {mode === "self-check" ? <SelfCheckView /> : <InspectorDashboard />}
      </main>
    </div>
  );
}

import { motion } from "framer-motion";
import { useEffect, useState } from "react";
import { fetchStats } from "../api";
import { BatchScanPanel } from "../components/BatchScanPanel";
import { MultiAngleForm } from "../components/MultiAngleForm";
import { StatCard } from "../components/ui/StatCard";
import { useAuth } from "../context/AuthContext";
import { DashboardStats } from "../types";

type Tab = "batch" | "multi-angle";

export function InspectorDashboard() {
  const { user } = useAuth();
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [tab, setTab] = useState<Tab>("batch");

  async function refresh() {
    const s = await fetchStats();
    setStats(s);
  }

  useEffect(() => {
    refresh();
  }, []);

  return (
    <div className="mx-auto max-w-5xl px-4 py-8 sm:px-6">
      <motion.div initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }} className="mb-6">
        <h1 className="font-display text-2xl font-bold text-ink-900">
          Inspector console — {user?.name?.split(" ")[0]}
        </h1>
        <p className="text-sm text-ink-500">
          Batch-scan a shelf, or run a full 8-angle inspection on a single product.
        </p>
      </motion.div>

      {stats && (
        <div className="mb-8 grid grid-cols-2 gap-3 sm:grid-cols-4">
          <StatCard label="Products scanned" value={stats.totalScans} accent="brand" icon={<span>🗂️</span>} />
          <StatCard label="Compliant" value={stats.fullyCompliant} accent="pass" icon={<span>✅</span>} />
          <StatCard label="Violations found" value={stats.withViolations} accent="fail" icon={<span>🚩</span>} />
          <StatCard label="Needs re-check" value={stats.totalUnclear} accent="unclear" icon={<span>❔</span>} />
        </div>
      )}

      <div className="mb-5 flex gap-2">
        <button
          onClick={() => setTab("batch")}
          className={`rounded-lg px-4 py-2 text-sm font-medium transition ${
            tab === "batch" ? "bg-ink-900 text-white" : "bg-white text-ink-600 hover:bg-ink-100"
          }`}
        >
          Batch shelf scan
        </button>
        <button
          onClick={() => setTab("multi-angle")}
          className={`rounded-lg px-4 py-2 text-sm font-medium transition ${
            tab === "multi-angle" ? "bg-ink-900 text-white" : "bg-white text-ink-600 hover:bg-ink-100"
          }`}
        >
          8-angle inspection
        </button>
      </div>

      {tab === "batch" ? (
        <BatchScanPanel onScan={refresh} />
      ) : (
        <MultiAngleForm onComplete={refresh} />
      )}
    </div>
  );
}

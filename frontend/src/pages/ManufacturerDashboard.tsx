import { motion } from "framer-motion";
import { useEffect, useState } from "react";
import { fetchStats } from "../api";
import { ScanForm } from "../components/ScanForm";
import { StatCard } from "../components/ui/StatCard";
import { useAuth } from "../context/AuthContext";
import { DashboardStats } from "../types";

export function ManufacturerDashboard() {
  const { user } = useAuth();
  const [stats, setStats] = useState<DashboardStats | null>(null);

  async function refresh() {
    const s = await fetchStats();
    setStats(s);
  }

  useEffect(() => {
    refresh();
  }, []);

  return (
    <div className="mx-auto max-w-5xl px-4 py-8 sm:px-6">
      <motion.div
        initial={{ opacity: 0, y: -8 }}
        animate={{ opacity: 1, y: 0 }}
        className="mb-6"
      >
        <h1 className="font-display text-2xl font-bold text-ink-900">
          Welcome back, {user?.name?.split(" ")[0]}
        </h1>
        <p className="text-sm text-ink-500">
          Self-check your labels against Rule 6 before they hit the shelf.
        </p>
      </motion.div>

      {stats && (
        <div className="mb-8 grid grid-cols-2 gap-3 sm:grid-cols-4">
          <StatCard label="Total scans" value={stats.totalScans} accent="brand" icon={<span>🗂️</span>} />
          <StatCard label="Fully compliant" value={stats.fullyCompliant} accent="pass" icon={<span>✅</span>} />
          <StatCard label="With violations" value={stats.withViolations} accent="fail" icon={<span>⚠️</span>} />
          <StatCard label="Unclear fields" value={stats.totalUnclear} accent="unclear" icon={<span>❔</span>} />
        </div>
      )}

      <ScanForm
        title="Pre-market label check"
        subtitle="Photograph a label to see every Rule 6 declaration checked in seconds."
        onScanComplete={refresh}
      />

      {stats && stats.recentScans.length > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="mt-8 rounded-2xl border border-ink-100 bg-white p-5 shadow-soft"
        >
          <h3 className="font-display text-sm font-semibold text-ink-800">Recent scans</h3>
          <div className="mt-3 flex flex-col divide-y divide-ink-100">
            {stats.recentScans.map((s) => (
              <div key={s.scanId} className="flex items-center justify-between py-2.5 text-sm">
                <div>
                  <div className="font-medium text-ink-800">
                    {s.productName || s.scanId.slice(0, 8)}
                  </div>
                  <div className="text-xs text-ink-400">
                    {new Date(s.createdAt).toLocaleString()}
                  </div>
                </div>
                <div className="flex gap-1.5 text-xs">
                  <span className="rounded-full bg-green-100 px-2 py-0.5 text-green-800">
                    {s.summary.pass}
                  </span>
                  <span className="rounded-full bg-red-100 px-2 py-0.5 text-red-800">
                    {s.summary.fail}
                  </span>
                  <span className="rounded-full bg-amber-100 px-2 py-0.5 text-amber-800">
                    {s.summary.unclear}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </motion.div>
      )}

      {stats && stats.topViolatedFields.length > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="mt-6 rounded-2xl border border-ink-100 bg-white p-5 shadow-soft"
        >
          <h3 className="font-display text-sm font-semibold text-ink-800">
            Your most frequent violations
          </h3>
          <div className="mt-3 flex flex-col gap-2">
            {stats.topViolatedFields.map((f) => (
              <div key={f.label} className="flex items-center gap-3 text-sm">
                <span className="w-40 shrink-0 truncate text-ink-600">{f.label}</span>
                <div className="h-2 flex-1 rounded-full bg-ink-100">
                  <div
                    className="h-2 rounded-full bg-red-400"
                    style={{
                      width: `${Math.min(100, (f.count / stats.topViolatedFields[0].count) * 100)}%`,
                    }}
                  />
                </div>
                <span className="w-6 text-right text-xs text-ink-400">{f.count}</span>
              </div>
            ))}
          </div>
        </motion.div>
      )}
    </div>
  );
}

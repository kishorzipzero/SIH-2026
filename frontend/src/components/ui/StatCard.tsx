import { motion } from "framer-motion";
import { ReactNode, useEffect, useState } from "react";

function useCountUp(target: number, duration = 800) {
  const [value, setValue] = useState(0);
  useEffect(() => {
    let raf: number;
    const start = performance.now();
    function tick(now: number) {
      const progress = Math.min(1, (now - start) / duration);
      setValue(Math.round(target * (1 - Math.pow(1 - progress, 3))));
      if (progress < 1) raf = requestAnimationFrame(tick);
    }
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [target, duration]);
  return value;
}

export function StatCard({
  label,
  value,
  accent = "brand",
  icon,
}: {
  label: string;
  value: number;
  accent?: "brand" | "pass" | "fail" | "unclear";
  icon?: ReactNode;
}) {
  const animated = useCountUp(value);
  const accentClasses: Record<string, string> = {
    brand: "text-brand-600 bg-brand-50",
    pass: "text-pass bg-green-50",
    fail: "text-fail bg-red-50",
    unclear: "text-unclear bg-amber-50",
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={{ y: -3 }}
      className="rounded-xl border border-ink-100 bg-white p-4 shadow-soft"
    >
      <div className="flex items-center justify-between">
        <span className="text-xs font-medium uppercase tracking-wide text-ink-400">{label}</span>
        {icon && (
          <span className={`flex h-8 w-8 items-center justify-center rounded-lg ${accentClasses[accent]}`}>
            {icon}
          </span>
        )}
      </div>
      <div className="mt-2 font-display text-3xl font-bold text-ink-900">{animated}</div>
    </motion.div>
  );
}

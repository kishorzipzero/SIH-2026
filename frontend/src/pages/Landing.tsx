import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

const FEATURES = [
  {
    title: "Scan & Extract",
    desc: "Photograph any packaged commodity label — OCR pulls every declaration, in English or Hindi.",
    icon: "📷",
  },
  {
    title: "Rule 6 Checklist Engine",
    desc: "Every mandatory declaration is checked against Legal Metrology Rule 6, tagged with its exact clause.",
    icon: "📋",
  },
  {
    title: "Placement & Readability",
    desc: "Flags undersized MRP text with a font-size heuristic, and surfaces low-confidence reads as 'unclear' instead of guessing.",
    icon: "🔍",
  },
  {
    title: "Violation Reports",
    desc: "Batch-scan a shelf, then export a CSV violation summary ready for enforcement action.",
    icon: "📊",
  },
  {
    title: "Compliance Repository",
    desc: "Every scan is saved to your history — track compliance trends across products over time.",
    icon: "🗄️",
  },
  {
    title: "Role-Based Dashboards",
    desc: "Manufacturers get a pre-market self-check tool; inspectors get a shelf-audit and enforcement dashboard.",
    icon: "🧭",
  },
];

const container = {
  hidden: {},
  show: { transition: { staggerChildren: 0.08 } },
};
const item = {
  hidden: { opacity: 0, y: 16 },
  show: { opacity: 1, y: 0 },
};

export function Landing() {
  const { user } = useAuth();

  return (
    <div className="overflow-hidden">
      <section className="relative overflow-hidden bg-brand-gradient">
        <div className="absolute inset-0 bg-mesh" />
        <div className="relative mx-auto flex max-w-6xl flex-col items-center px-6 pb-24 pt-20 text-center sm:pt-28">
          <motion.span
            initial={{ opacity: 0, y: -8 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-5 rounded-full bg-white/10 px-4 py-1.5 text-xs font-semibold uppercase tracking-wide text-brand-100 backdrop-blur"
          >
            SIH26034 · Ministry of Consumer Affairs, Food &amp; Public Distribution
          </motion.span>
          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="font-display max-w-3xl text-4xl font-extrabold leading-tight text-white sm:text-5xl"
          >
            Legal Metrology compliance, verified in one scan.
          </motion.h1>
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="mt-5 max-w-xl text-base text-brand-100 sm:text-lg"
          >
            Photograph a product label and instantly check it against every mandatory
            declaration in the Packaged Commodities Rules, 2011 — missing fields,
            undersized MRP text, and absent origin declarations, all flagged and
            clause-tagged.
          </motion.p>
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="mt-8 flex flex-wrap items-center justify-center gap-3"
          >
            <Link
              to={user ? (user.role === "inspector" ? "/inspector" : "/dashboard") : "/register"}
              className="rounded-xl bg-white px-6 py-3 text-sm font-bold text-brand-700 shadow-glow transition hover:scale-105"
            >
              {user ? "Go to dashboard" : "Get started free"}
            </Link>
            {!user && (
              <Link
                to="/login"
                className="rounded-xl border border-white/30 px-6 py-3 text-sm font-semibold text-white transition hover:bg-white/10"
              >
                I already have an account
              </Link>
            )}
          </motion.div>
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-6 py-20">
        <div className="mb-12 text-center">
          <h2 className="font-display text-2xl font-bold text-ink-900 sm:text-3xl">
            One engine, two ways to use it
          </h2>
          <p className="mx-auto mt-2 max-w-xl text-ink-600">
            Manufacturers self-check before printing. Inspectors batch-scan shelves and
            log violations. Same Rule 6 checklist underneath.
          </p>
        </div>

        <motion.div
          variants={container}
          initial="hidden"
          whileInView="show"
          viewport={{ once: true, margin: "-80px" }}
          className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3"
        >
          {FEATURES.map((f) => (
            <motion.div
              key={f.title}
              variants={item}
              whileHover={{ y: -4 }}
              className="rounded-2xl border border-ink-100 bg-white p-6 shadow-soft transition"
            >
              <div className="mb-3 text-2xl">{f.icon}</div>
              <h3 className="font-display font-semibold text-ink-900">{f.title}</h3>
              <p className="mt-1.5 text-sm text-ink-600">{f.desc}</p>
            </motion.div>
          ))}
        </motion.div>
      </section>

      <section className="border-t border-ink-100 bg-white py-16">
        <div className="mx-auto max-w-3xl px-6 text-center text-xs text-ink-400">
          Clause references shown throughout the app are indicative mappings to Rule 6
          for MVP triage — verify exact sub-clause text against the official Gazette
          notification before use in enforcement or legal filings. The MRP font-size
          check is a relative heuristic, not an mm-calibrated measurement.
        </div>
      </section>
    </div>
  );
}

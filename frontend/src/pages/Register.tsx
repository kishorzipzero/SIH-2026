import { motion } from "framer-motion";
import { FormEvent, useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { Role } from "../types";

const ROLES: { id: Role; label: string; desc: string; icon: string }[] = [
  {
    id: "manufacturer",
    label: "Manufacturer / Packer",
    desc: "Self-check labels before printing or dispatch.",
    icon: "🏭",
  },
  {
    id: "inspector",
    label: "Enforcement Inspector",
    desc: "Batch-scan shelves and log violations.",
    icon: "🛡️",
  },
];

export function Register() {
  const { register, user } = useAuth();
  const navigate = useNavigate();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [organization, setOrganization] = useState("");
  const [role, setRole] = useState<Role>("manufacturer");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (user) navigate(user.role === "inspector" ? "/inspector" : "/dashboard", { replace: true });
  }, [user, navigate]);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setError(null);
    setLoading(true);
    try {
      await register({ name, email, password, role, organization });
      navigate(role === "inspector" ? "/inspector" : "/dashboard");
    } catch (err) {
      setError((err as Error).message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="flex min-h-[calc(100vh-64px)] items-center justify-center bg-mesh bg-ink-50 px-4 py-12">
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-lg rounded-2xl border border-ink-100 bg-white p-8 shadow-soft"
      >
        <h1 className="font-display text-2xl font-bold text-ink-900">Create your account</h1>
        <p className="mt-1 text-sm text-ink-600">
          Pick the role that matches how you'll use LabelCheck.
        </p>

        <div className="mt-5 grid grid-cols-2 gap-3">
          {ROLES.map((r) => (
            <motion.button
              key={r.id}
              type="button"
              whileHover={{ y: -2 }}
              onClick={() => setRole(r.id)}
              className={`rounded-xl border p-4 text-left transition ${
                role === r.id
                  ? "border-brand-500 bg-brand-50 shadow-glow"
                  : "border-ink-200 hover:border-brand-300"
              }`}
            >
              <div className="text-xl">{r.icon}</div>
              <div className="mt-1 text-sm font-semibold text-ink-900">{r.label}</div>
              <div className="mt-0.5 text-xs text-ink-500">{r.desc}</div>
            </motion.button>
          ))}
        </div>

        <form onSubmit={handleSubmit} className="mt-6 flex flex-col gap-4">
          <div className="grid grid-cols-2 gap-4">
            <label className="flex flex-col gap-1 text-sm">
              <span className="font-medium text-ink-700">Full name</span>
              <input
                required
                className="rounded-lg border border-ink-200 px-3 py-2 outline-none focus:border-brand-400 focus:ring-2 focus:ring-brand-100"
                value={name}
                onChange={(e) => setName(e.target.value)}
              />
            </label>
            <label className="flex flex-col gap-1 text-sm">
              <span className="font-medium text-ink-700">
                {role === "inspector" ? "Department" : "Company"} (optional)
              </span>
              <input
                className="rounded-lg border border-ink-200 px-3 py-2 outline-none focus:border-brand-400 focus:ring-2 focus:ring-brand-100"
                value={organization}
                onChange={(e) => setOrganization(e.target.value)}
              />
            </label>
          </div>
          <label className="flex flex-col gap-1 text-sm">
            <span className="font-medium text-ink-700">Email</span>
            <input
              type="email"
              required
              className="rounded-lg border border-ink-200 px-3 py-2 outline-none focus:border-brand-400 focus:ring-2 focus:ring-brand-100"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
          </label>
          <label className="flex flex-col gap-1 text-sm">
            <span className="font-medium text-ink-700">Password</span>
            <input
              type="password"
              required
              minLength={8}
              className="rounded-lg border border-ink-200 px-3 py-2 outline-none focus:border-brand-400 focus:ring-2 focus:ring-brand-100"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="At least 8 characters"
            />
          </label>

          {error && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              className="rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700"
            >
              {error}
            </motion.div>
          )}

          <motion.button
            whileHover={{ scale: 1.01 }}
            whileTap={{ scale: 0.99 }}
            type="submit"
            disabled={loading}
            className="mt-2 rounded-lg bg-brand-gradient px-4 py-2.5 text-sm font-semibold text-white shadow-glow disabled:opacity-50"
          >
            {loading ? "Creating account..." : "Create account"}
          </motion.button>
        </form>

        <p className="mt-6 text-center text-sm text-ink-600">
          Already have an account?{" "}
          <Link to="/login" className="font-medium text-brand-600 hover:underline">
            Log in
          </Link>
        </p>
      </motion.div>
    </div>
  );
}

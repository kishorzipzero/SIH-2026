import { motion } from "framer-motion";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

export function Navbar() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  function handleLogout() {
    logout();
    navigate("/");
  }

  return (
    <header className="sticky top-0 z-30 border-b border-ink-100 bg-white/80 backdrop-blur-md">
      <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-3 sm:px-6">
        <Link to="/" className="flex items-center gap-2">
          <motion.span
            whileHover={{ rotate: 8, scale: 1.05 }}
            className="flex h-8 w-8 items-center justify-center rounded-lg bg-brand-gradient text-sm font-bold text-white shadow-glow"
          >
            LC
          </motion.span>
          <span className="font-display text-lg font-bold text-ink-900">LabelCheck</span>
        </Link>

        <nav className="flex items-center gap-3">
          {user ? (
            <>
              <Link
                to={user.role === "inspector" ? "/inspector" : "/dashboard"}
                className="hidden text-sm font-medium text-ink-600 hover:text-brand-600 sm:block"
              >
                Dashboard
              </Link>
              <div className="hidden items-center gap-2 rounded-full bg-ink-100 px-3 py-1.5 text-xs font-medium text-ink-600 sm:flex">
                <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
                {user.name} · {user.role === "inspector" ? "Inspector" : "Manufacturer"}
              </div>
              <motion.button
                whileHover={{ scale: 1.03 }}
                whileTap={{ scale: 0.97 }}
                onClick={handleLogout}
                className="rounded-lg border border-ink-200 px-3 py-1.5 text-sm font-medium text-ink-600 hover:border-red-300 hover:text-red-600"
              >
                Log out
              </motion.button>
            </>
          ) : (
            <>
              <Link
                to="/login"
                className="text-sm font-medium text-ink-600 hover:text-brand-600"
              >
                Log in
              </Link>
              <motion.div whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }}>
                <Link
                  to="/register"
                  className="rounded-lg bg-brand-gradient px-4 py-2 text-sm font-semibold text-white shadow-glow"
                >
                  Get started
                </Link>
              </motion.div>
            </>
          )}
        </nav>
      </div>
    </header>
  );
}

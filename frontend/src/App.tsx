import { AnimatePresence } from "framer-motion";
import { BrowserRouter, Route, Routes, useLocation } from "react-router-dom";
import { Navbar } from "./components/Navbar";
import { ProtectedRoute } from "./components/ProtectedRoute";
import { PageTransition } from "./components/ui/PageTransition";
import { AuthProvider } from "./context/AuthContext";
import { InspectorDashboard } from "./pages/InspectorDashboard";
import { Landing } from "./pages/Landing";
import { Login } from "./pages/Login";
import { ManufacturerDashboard } from "./pages/ManufacturerDashboard";
import { Register } from "./pages/Register";

function AnimatedRoutes() {
  const location = useLocation();
  return (
    <AnimatePresence mode="wait">
      <Routes location={location} key={location.pathname}>
        <Route
          path="/"
          element={
            <PageTransition>
              <Landing />
            </PageTransition>
          }
        />
        <Route
          path="/login"
          element={
            <PageTransition>
              <Login />
            </PageTransition>
          }
        />
        <Route
          path="/register"
          element={
            <PageTransition>
              <Register />
            </PageTransition>
          }
        />
        <Route
          path="/dashboard"
          element={
            <ProtectedRoute role="manufacturer">
              <PageTransition>
                <ManufacturerDashboard />
              </PageTransition>
            </ProtectedRoute>
          }
        />
        <Route
          path="/inspector"
          element={
            <ProtectedRoute role="inspector">
              <PageTransition>
                <InspectorDashboard />
              </PageTransition>
            </ProtectedRoute>
          }
        />
      </Routes>
    </AnimatePresence>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <div className="min-h-screen bg-ink-50">
          <Navbar />
          <AnimatedRoutes />
        </div>
      </BrowserRouter>
    </AuthProvider>
  );
}

import { Routes, Route, Navigate, useLocation, useNavigate } from "react-router-dom";
import { useCallback, useEffect, lazy, Suspense } from "react";
import { Menu } from "lucide-react";
import Sidebar from "./components/layout/Sidebar/Sidebar";
import WorkspaceLayout from "./components/layout/Workspace/WorkspaceLayout";
import { ToastCard } from "./components/ui/Toast";
import { useWorkspace } from "./context/WorkspaceContext";
import { registerAuthExpiredListener } from "./api/apiClient";

const Dashboard = lazy(() => import("./Pages/Dashboard"));
const Projects = lazy(() => import("./Pages/Projects"));
const Users = lazy(() => import("./Pages/Users"));
const Settings = lazy(() => import("./Pages/Settings"));
const Login = lazy(() => import("./Pages/Login"));

const PageLoader = () => (
  <div className="flex h-full w-full items-center justify-center p-8">
    <div className="h-8 w-8 animate-spin rounded-full border-4 border-amber-500 border-t-transparent" />
  </div>
);

export default function App() {
  const { ui, toggleMobileDrawer, toasts, removeToast } = useWorkspace();
  const location = useLocation();
  const navigate = useNavigate();

  useEffect(() => {
    registerAuthExpiredListener(() => {
      navigate("/login", { replace: true });
    });
    return () => registerAuthExpiredListener(null);
  }, [navigate]);

  const closeDrawer = useCallback(() => toggleMobileDrawer(false), [toggleMobileDrawer]);
  const openDrawer = useCallback(() => toggleMobileDrawer(true), [toggleMobileDrawer]);

  const token = localStorage.getItem("mock_token");
  const isAuthenticated = !!token;

  if (!isAuthenticated && location.pathname !== "/login") {
    const redirectTarget = location.pathname + location.search;
    return <Navigate to={`/login?redirect=${encodeURIComponent(redirectTarget)}`} replace={true} />;
  }

  if (isAuthenticated && location.pathname === "/login") {
    return <Navigate to="/" replace={true} />;
  }

  if (location.pathname === "/login") {
    return (
      <Suspense fallback={<PageLoader />}>
        <Login />
      </Suspense>
    );
  }

  return (
    <>
      <WorkspaceLayout>
        <Sidebar isOpen={ui.isMobileDrawerOpen} closeDrawer={closeDrawer} />

        <main className="flex h-screen flex-1 flex-col overflow-hidden bg-brand-bg">
          {/* Mobile Header */}
          <header className="flex items-center justify-between border-b border-slate-200 bg-white px-3 xs:px-4 py-3 shadow-sm md:hidden">
            <button onClick={openDrawer} className="p-2 hover:bg-slate-100 text-brand-header active:scale-95 rounded-lg transition-all" aria-label="Toggle Menu">
              <Menu className="w-5 h-5" />
            </button>
            <h1 className="text-base xs:text-lg font-semibold text-brand-header">Horizon</h1>
            <div className="w-8" />
          </header>

          <section className="flex-1 overflow-y-auto p-2 xs:p-3 sm:p-4">
            <Suspense fallback={<PageLoader />}>
              <Routes>
                <Route path="/" element={<Dashboard />} />
                <Route path="/projects" element={<Projects />} />
                <Route path="/users" element={<Users />} />
                <Route path="/settings" element={<Settings />} />
                <Route path="*" element={<Navigate to="/" replace={true} />} />
              </Routes>
            </Suspense>
          </section>
        </main>
      </WorkspaceLayout>

      <div className="fixed top-4 right-4 z-50 flex flex-col gap-2 pointer-events-none">
        {toasts.map((toast) => (
          <ToastCard key={toast.id} toast={toast} onDismiss={removeToast} />
        ))}
      </div>
    </>
  );
}
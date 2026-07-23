import { Routes, Route, Navigate, useLocation } from "react-router-dom";
import { useCallback } from "react";
import { Menu } from "lucide-react";
import Sidebar from "./components/layout/Sidebar/Sidebar";
import WorkspaceLayout from "./components/layout/Workspace/WorkspaceLayout";
import Dashboard from "./Pages/Dashboard";
import Projects from "./Pages/Projects";
import Users from "./Pages/Users";
import Settings from "./Pages/Settings";
import Login from "./Pages/Login";
import { useWorkspace } from "./context/WorkspaceContext";

export default function App() {
  const { ui, toggleMobileDrawer } = useWorkspace();
  const location = useLocation();

  const closeDrawer = useCallback(() => toggleMobileDrawer(false), [toggleMobileDrawer]);
  const openDrawer = useCallback(() => toggleMobileDrawer(true), [toggleMobileDrawer]);

  // Auth Guard checking for active bearer credentials (FE-13.1)
  const token = localStorage.getItem("mock_token");
  const isAuthenticated = !!token;

  // Unauthenticated fallback redirects
  if (!isAuthenticated && location.pathname !== "/login") {
    return <Navigate to="/login" replace={true} />;
  }

  // Prevent authenticated user from visiting login page
  if (isAuthenticated && location.pathname === "/login") {
    return <Navigate to="/" replace={true} />;
  }

  // Render Login page standalone without sidebar layout frame
  if (location.pathname === "/login") {
    return <Login />;
  }

  return (
    <WorkspaceLayout>
      <Sidebar isOpen={ui.isMobileDrawerOpen} closeDrawer={closeDrawer} />

      <main className="flex h-screen flex-1 flex-col overflow-hidden bg-brand-bg">
        {/* Mobile Header */}
        <header className="flex items-center justify-between border-b border-slate-200 bg-white px-4 py-3 shadow-sm md:hidden">
          <button onClick={openDrawer} className="p-2 hover:bg-slate-100 text-brand-header active:scale-95 rounded-lg transition-all" aria-label="Toggle Menu">
            <Menu className="w-5 h-5" />
          </button>
          <h1 className="text-lg font-semibold text-brand-header">Horizon</h1>
          <div className="w-8" />
        </header>

        {/* Page Content */}
        <section className="flex-1 overflow-y-auto p-3 sm:p-4">
          <Routes>
            <Route path="/" element={<Dashboard />} />
            <Route path="/projects" element={<Projects />} />
            <Route path="/users" element={<Users />} />
            <Route path="/settings" element={<Settings />} />
            {/* Fallback wildcard to root */}
            <Route path="*" element={<Navigate to="/" replace={true} />} />
          </Routes>
        </section>
      </main>
    </WorkspaceLayout>
  );
}
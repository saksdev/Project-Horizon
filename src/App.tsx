import { Routes, Route } from "react-router-dom";
import { useState } from "react";

import Sidebar from "./components/layout/Sidebar/Sidebar";
import WorkspaceLayout from "./components/layout/Workspace/WorkspaceLayout";

import Dashboard from "./Pages/Dashboard";
import Projects from "./Pages/Projects";
import Users from "./Pages/Users";
import Settings from "./Pages/Settings";

export default function App() {
  const [isMobileDrawerOpen, setIsMobileDrawerOpen] = useState(false);

  return (
    <WorkspaceLayout>
      <Sidebar
        isOpen={isMobileDrawerOpen}
        closeDrawer={() => setIsMobileDrawerOpen(false)}
      />

      <main className="flex h-screen flex-1 flex-col overflow-hidden bg-slate-100">
        {/* Mobile Header */}
        <header className="flex items-center justify-between border-b border-slate-200 bg-white px-5 py-4 shadow-sm md:hidden">
          <button
            onClick={() => setIsMobileDrawerOpen(true)}
            className="rounded-md p-2 transition hover:bg-slate-100"
          >
            ☰
          </button>

          <h1 className="text-lg font-semibold text-slate-800">
            Horizon
          </h1>

          {/* Empty div keeps title centered */}
          <div className="w-9" />
        </header>

        {/* Page Content */}
        <section className="flex-1 overflow-y-auto p-5 md:p-8">
          <Routes>
            <Route path="/" element={<Dashboard />} />
            <Route path="/projects" element={<Projects />} />
            <Route path="/users" element={<Users />} />
            <Route path="/settings" element={<Settings />} />
          </Routes>
        </section>
      </main>
    </WorkspaceLayout>
  );
}
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

      <main className="h-screen overflow-y-auto bg-slate-50 flex flex-col">
        <header className="md:hidden flex items-center p-4 bg-white border-b border-slate-200">
          <button
            className="text-slate-600 p-2"
            onClick={() => setIsMobileDrawerOpen(true)}
          >
            ☰
          </button>

          <h2 className="ml-4 text-lg font-bold">Horizon</h2>
        </header>

        <Routes>
          <Route path="/" element={<Dashboard />} />
          <Route path="/projects" element={<Projects />} />
          <Route path="/users" element={<Users />} />
          <Route path="/settings" element={<Settings />} />
        </Routes>
      </main>
    </WorkspaceLayout>
  );
}
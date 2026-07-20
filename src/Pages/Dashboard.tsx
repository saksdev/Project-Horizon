import { useSearchParams } from "react-router-dom";
import { useCallback } from "react";
import { LayoutDashboard, BarChart3, Activity, FileText } from "lucide-react";

const TABS = [
  { id: "overview", label: "Overview", icon: LayoutDashboard },
  { id: "analytics", label: "Analytics", icon: BarChart3 },
  { id: "activity", label: "System Activity", icon: Activity },
  { id: "reports", label: "Reports & Audits", icon: FileText },
];

export default function Dashboard() {
  const [searchParams, setSearchParams] = useSearchParams();
  const activeTab = searchParams.get("tab") || "overview";

  const handleTabChange = useCallback((tabId: string) => {
    setSearchParams({ tab: tabId });
  }, [setSearchParams]);

  return (
    <div className="w-full overflow-x-auto max-w-5xl mx-auto space-y-6">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between pb-4 border-b border-slate-200 gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-800 tracking-tight">Dashboard Workspace</h1>
          <p className="text-xs text-slate-500 mt-1">Real-time metrics, telemetry coordinates, and query parameter history controls.</p>
        </div>

        {/* Query Parameter Tab Selectors (FE-07.1) - Horizontal Scroll Bar */}
        <div className="flex w-full md:w-auto overflow-x-auto bg-slate-200/70 p-1 rounded-xl gap-1 shrink-0 scrollbar-none">
          {TABS.map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => handleTabChange(tab.id)}
                className={`flex items-center justify-center gap-2 px-3 py-2 rounded-lg text-xs font-bold transition-all shrink-0 flex-1 md:flex-initial text-nowrap ${
                  isActive
                    ? "bg-white text-blue-600 shadow-sm"
                    : "text-slate-600 hover:text-slate-900 hover:bg-slate-100/50"
                }`}
              >
                <Icon className="w-3.5 h-3.5 shrink-0" />
                <span>{tab.label}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Dynamic Panel Content based on URL Query Shift */}
      <div className="bg-white p-5 sm:p-6 rounded-2xl border border-slate-200/80 shadow-sm min-h-[300px]">
        {activeTab === "overview" && (
          <div className="space-y-3">
            <h2 className="text-lg font-bold text-slate-800">Workspace Overview Panel</h2>
            <p className="text-xs text-slate-500">Active URL coordinate: <code className="bg-slate-100 px-2 py-0.5 rounded text-blue-600 font-mono">?tab=overview</code></p>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 pt-4">
              <div className="bg-blue-50/50 p-4 rounded-xl border border-blue-100">
                <span className="text-[10px] uppercase font-bold text-blue-600">Total Requests</span>
                <p className="text-xl font-extrabold text-slate-800 mt-1">1,248,900</p>
              </div>
              <div className="bg-emerald-50/50 p-4 rounded-xl border border-emerald-100">
                <span className="text-[10px] uppercase font-bold text-emerald-600">System Health</span>
                <p className="text-xl font-extrabold text-slate-800 mt-1">99.98%</p>
              </div>
              <div className="bg-purple-50/50 p-4 rounded-xl border border-purple-100 sm:col-span-2 md:col-span-1">
                <span className="text-[10px] uppercase font-bold text-purple-600">Active Sessions</span>
                <p className="text-xl font-extrabold text-slate-800 mt-1">842</p>
              </div>
            </div>
          </div>
        )}

        {activeTab === "analytics" && (
          <div className="space-y-3">
            <h2 className="text-lg font-bold text-slate-800">Real-time Telemetry Analytics</h2>
            <p className="text-xs text-slate-500">Active URL coordinate: <code className="bg-slate-100 px-2 py-0.5 rounded text-blue-600 font-mono">?tab=analytics</code></p>
            <div className="p-4 bg-slate-50 border border-slate-200 rounded-xl font-mono text-xs text-slate-600">
              [Telemetry Tracker]: Streaming incoming bandwidth and payload sizes...
            </div>
          </div>
        )}

        {activeTab === "activity" && (
          <div className="space-y-3">
            <h2 className="text-lg font-bold text-slate-800">System Logs & Operations Activity</h2>
            <p className="text-xs text-slate-500">Active URL coordinate: <code className="bg-slate-100 px-2 py-0.5 rounded text-blue-600 font-mono">?tab=activity</code></p>
            <div className="p-4 bg-slate-50 border border-slate-200 rounded-xl font-mono text-xs text-slate-600">
              [Activity Log]: User saksdev@mekari.co.in authenticated via OAuth2.0
            </div>
          </div>
        )}

        {activeTab === "reports" && (
          <div className="space-y-3">
            <h2 className="text-lg font-bold text-slate-800">Export & Audit Reports</h2>
            <p className="text-xs text-slate-500">Active URL coordinate: <code className="bg-slate-100 px-2 py-0.5 rounded text-blue-600 font-mono">?tab=reports</code></p>
            <div className="p-4 bg-slate-50 border border-slate-200 rounded-xl font-mono text-xs text-slate-600">
              [Audit Security]: Compliance security scan passed with 0 vulnerabilities.
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
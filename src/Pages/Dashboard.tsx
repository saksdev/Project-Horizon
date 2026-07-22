import { useSearchParams } from "react-router-dom";
import { useCallback, useMemo } from "react";
import {
  LayoutDashboard,
  BarChart3,
  Activity,
  FileText,
  Search,
  Filter,
} from "lucide-react";
import { InputField } from "../components/ui/InputField";
import { useWorkspace } from "../context/WorkspaceContext";

const TABS = [
  { id: "overview", label: "Overview", icon: LayoutDashboard },
  { id: "analytics", label: "Analytics", icon: BarChart3 },
  { id: "activity", label: "System Activity", icon: Activity },
  { id: "reports", label: "Reports & Audits", icon: FileText },
];

/**
 * Main Dashboard Workspace View Component.
 * Orchestrates URL search parameters, dynamic tab views, real-time log search, and browser history layers.
 * Subscribes to central WorkspaceContext (FE-10.1 & FE-10.3).
 */
export default function Dashboard() {
  const [searchParams, setSearchParams] = useSearchParams();
  const { records } = useWorkspace();

  // Route Parameter Parsing (FE-08.1 & FE-08.3): Validates URL tab key against schema and primes deep-link views with safe fallback to "overview"
  const rawTab = searchParams.get("tab") || "";
  const activeTab = TABS.some((t) => t.id === rawTab) ? rawTab : "overview";
  const searchQuery = searchParams.get("query") || "";

  /**
   * Handles tab switching by updating the URL search parameter.
   * Records explicit history checkpoints to enable accurate browser Back/Forward navigation.
   */
  const handleTabChange = useCallback(
    (tabId: string) => {
      setSearchParams((prev) => {
        const next = new URLSearchParams(prev);
        next.set("tab", tabId);
        return next;
      });
    },
    [setSearchParams]
  );

  /**
   * Handles real-time search query input mutations.
   * Uses in-place history replacement ({ replace: true }) to prevent browser history stack pollution.
   */
  const handleQueryChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const val = e.target.value;
      setSearchParams(
        (prev) => {
          const next = new URLSearchParams(prev);
          if (val) {
            next.set("query", val);
          } else {
            next.delete("query");
          }
          return next;
        },
        { replace: true }
      );
    },
    [setSearchParams]
  );

  /**
   * Memoized log filtering logic subscribing directly to central store records.logs (FE-10.1 & FE-10.3).
   */
  const filteredLogs = useMemo(() => {
    const term = searchQuery.trim().toLowerCase();
    if (!term) return records.logs;

    return records.logs.filter(
      (log) =>
        log.text.toLowerCase().includes(term) ||
        log.level.toLowerCase().includes(term) ||
        log.type.toLowerCase().includes(term)
    );
  }, [searchQuery, records.logs]);

  return (
    <div className="w-full space-y-3">
      {/* Header & Responsive Navigation Bar */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between pb-3 border-b border-slate-200 gap-3">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-slate-800 tracking-tight">
            Dashboard Workspace ({records.displayName})
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Real-time metrics, telemetry coordinates, and query parameter
            history controls. ({records.contactEmail})
          </p>
        </div>

        {/* Tab Controls (Fluid Horizontal Scroll Bar on Mobile Viewports) */}
        <div className="w-full md:w-auto overflow-x-auto scrollbar-none" role="tablist">
          <div className="inline-flex min-w-max bg-slate-200/70 p-1 rounded-xl gap-1">
            {TABS.map((tab) => {
              const Icon = tab.icon;
              const isActive = activeTab === tab.id;

              return (
                <button
                  key={tab.id}
                  role="tab"
                  aria-selected={isActive}
                  aria-controls={`panel-${tab.id}`}
                  onClick={() => handleTabChange(tab.id)}
                  className={`flex items-center gap-2 px-3.5 py-1.5 rounded-lg text-xs font-bold whitespace-nowrap transition-all duration-200 ${
                    isActive
                      ? "bg-white text-blue-600 shadow-sm"
                      : "text-slate-600 hover:text-slate-900 hover:bg-slate-100/50"
                  }`}
                >
                  <Icon className="w-4 h-4 shrink-0" />
                  <span>{tab.label}</span>
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* Real-time Log Query Search Input Box & Parameter State Indicator */}
      <div className="bg-white p-3.5 sm:p-4 rounded-2xl border border-slate-200/80 shadow-sm flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3">
        <div className="flex-1 min-w-0">
          <InputField
            id="logQuery"
            name="logQuery"
            value={searchQuery}
            onChange={handleQueryChange}
            placeholder="Search logs or filter parameters (e.g. auth, warn, system)..."
            leftIcon={<Search className="w-4 h-4" />}
          />
        </div>
        <div className="flex items-center gap-2 text-xs font-semibold text-slate-500 shrink-0 self-end md:self-center">
          <Filter className="w-3.5 h-3.5 text-blue-600 shrink-0" />
          <span className="shrink-0">Active Query Param:</span>
          <code 
            className="bg-slate-100 px-2 py-0.5 rounded text-blue-600 font-mono font-bold truncate max-w-[160px] sm:max-w-[220px] inline-block"
            title={searchQuery ? `?query=${encodeURIComponent(searchQuery)}` : "None"}
          >
            {searchQuery ? `?query=${encodeURIComponent(searchQuery)}` : "None"}
          </code>
        </div>
      </div>

      {/* Dynamic Content Panel Container */}
      <div className="bg-white p-4 sm:p-5 rounded-2xl border border-slate-200/80 shadow-sm min-h-[300px]" role="tabpanel" id={`panel-${activeTab}`}>
        {activeTab === "overview" && (
          <div className="space-y-3">
            <h2 className="text-base sm:text-lg font-bold text-slate-800">
              Workspace Overview Panel
            </h2>

            <p className="text-xs text-slate-500">
              Active URL coordinate:{" "}
              <code className="bg-slate-100 px-2 py-0.5 rounded text-blue-600 font-mono">
                ?tab=overview
              </code>
            </p>

            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3 sm:gap-4 pt-2">
              <div className="bg-blue-50/50 p-3.5 sm:p-4 rounded-xl border border-blue-100">
                <span className="text-[10px] uppercase font-bold text-blue-600">
                  Total Requests
                </span>
                <p className="text-xl font-extrabold text-slate-800 mt-1">
                  1,248,900
                </p>
              </div>

              <div className="bg-emerald-50/50 p-3.5 sm:p-4 rounded-xl border border-emerald-100">
                <span className="text-[10px] uppercase font-bold text-emerald-600">
                  System Health
                </span>
                <p className="text-xl font-extrabold text-slate-800 mt-1">
                  99.98%
                </p>
              </div>

              <div className="bg-purple-50/50 p-3.5 sm:p-4 rounded-xl border border-purple-100 sm:col-span-2 md:col-span-1">
                <span className="text-[10px] uppercase font-bold text-purple-600">
                  Active Sessions
                </span>
                <p className="text-xl font-extrabold text-slate-800 mt-1">
                  842
                </p>
              </div>
            </div>
          </div>
        )}

        {activeTab === "analytics" && (
          <div className="space-y-3">
            <h2 className="text-base sm:text-lg font-bold text-slate-800">
              Real-time Telemetry Analytics
            </h2>

            <p className="text-xs text-slate-500">
              Active URL coordinate:{" "}
              <code className="bg-slate-100 px-2 py-0.5 rounded text-blue-600 font-mono">
                ?tab=analytics
              </code>
            </p>

            <div className="p-3.5 bg-slate-50 border border-slate-200 rounded-xl font-mono text-xs text-slate-600">
              [Telemetry Tracker]: Streaming incoming bandwidth and payload
              sizes for {records.contactEmail}...
            </div>
          </div>
        )}

        {activeTab === "activity" && (
          <div className="space-y-3">
            <div className="flex justify-between items-center">
              <h2 className="text-base sm:text-lg font-bold text-slate-800">
                System Logs & Operations Activity
              </h2>
              <span className="text-xs font-bold text-slate-500">
                {filteredLogs.length} logs found
              </span>
            </div>

            <div className="space-y-2">
              {filteredLogs.length > 0 ? (
                filteredLogs.map((log) => (
                  <div
                    key={log.id}
                    className="p-3 bg-slate-50 border border-slate-200/80 rounded-xl flex items-center justify-between gap-3"
                  >
                    <div className="flex items-center gap-2 font-mono text-xs text-slate-700 overflow-x-auto">
                      <span
                        className={`text-[10px] font-bold px-1.5 py-0.5 rounded ${
                          log.level === "INFO"
                            ? "bg-blue-100 text-blue-700"
                            : log.level === "WARN"
                            ? "bg-amber-100 text-amber-700"
                            : "bg-emerald-100 text-emerald-700"
                        }`}
                      >
                        {log.level}
                      </span>
                      <span>{log.text}</span>
                    </div>
                    <span className="text-[10px] text-slate-400 shrink-0 font-medium">
                      {log.time}
                    </span>
                  </div>
                ))
              ) : (
                <div className="p-8 text-center text-slate-400 text-xs italic bg-slate-50 rounded-xl border border-slate-200">
                  No logs matching parameter query "{searchQuery}"
                </div>
              )}
            </div>
          </div>
        )}

        {activeTab === "reports" && (
          <div className="space-y-3">
            <h2 className="text-base sm:text-lg font-bold text-slate-800">
              Export & Audit Reports
            </h2>

            <p className="text-xs text-slate-500">
              Active URL coordinate:{" "}
              <code className="bg-slate-100 px-2 py-0.5 rounded text-blue-600 font-mono">
                ?tab=reports
              </code>
            </p>

            <div className="p-3.5 bg-slate-50 border border-slate-200 rounded-xl font-mono text-xs text-slate-600">
              [Audit Security]: Compliance security scan passed for environment "{records.environmentMode}" with 0 vulnerabilities.
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
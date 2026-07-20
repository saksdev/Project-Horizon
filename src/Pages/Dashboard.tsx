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

const TABS = [
  { id: "overview", label: "Overview", icon: LayoutDashboard },
  { id: "analytics", label: "Analytics", icon: BarChart3 },
  { id: "activity", label: "System Activity", icon: Activity },
  { id: "reports", label: "Reports & Audits", icon: FileText },
];

const MOCK_LOGS = [
  { id: 1, type: "auth", level: "INFO", text: "[Activity Log]: User saksdev@mekari.co.in authenticated via OAuth2.0", time: "10 mins ago" },
  { id: 2, type: "security", level: "WARN", text: "[Security Alert]: Firewall blocked suspicious IP 192.168.1.45", time: "25 mins ago" },
  { id: 3, type: "database", level: "INFO", text: "[Database]: Central query executed in 1.4ms (Cluster A)", time: "1 hour ago" },
  { id: 4, type: "api", level: "WARN", text: "[API Gateway]: Rate limit threshold reached for endpoint /v1/users", time: "2 hours ago" },
  { id: 5, type: "system", level: "SUCCESS", text: "[System Deploy]: Release v2.4.0 successfully deployed to production", time: "3 hours ago" },
];

export default function Dashboard() {
  const [searchParams, setSearchParams] = useSearchParams();
  const activeTab = searchParams.get("tab") || "overview";

  const searchQuery = searchParams.get("query") || "";

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

  // Real-time conversion of input values directly to URL search parameters
  const handleQueryChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const val = e.target.value;
      setSearchParams((prev) => {
        const next = new URLSearchParams(prev);
        if (val) {
          next.set("query", val);
        } else {
          next.delete("query");
        }
        return next;
      });
    },
    [setSearchParams]
  );

  // Filter logs in real time based on active URL search parameters
  const filteredLogs = useMemo(() => {
    if (!searchQuery.trim()) return MOCK_LOGS;
    const term = searchQuery.toLowerCase();
    return MOCK_LOGS.filter(
      (log) =>
        log.text.toLowerCase().includes(term) ||
        log.level.toLowerCase().includes(term) ||
        log.type.toLowerCase().includes(term)
    );
  }, [searchQuery]);

  return (
    <div className="w-full max-w-5xl mx-auto space-y-6">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between pb-4 border-b border-slate-200 gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-800 tracking-tight">
            Dashboard Workspace
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            Real-time metrics, telemetry coordinates, and query parameter
            history controls.
          </p>
        </div>

        {/* Responsive Tabs */}
        <div className="w-full md:w-auto overflow-x-auto scrollbar-none">
          <div className="inline-flex min-w-max bg-slate-200/70 p-1 rounded-xl gap-1">
            {TABS.map((tab) => {
              const Icon = tab.icon;
              const isActive = activeTab === tab.id;

              return (
                <button
                  key={tab.id}
                  onClick={() => handleTabChange(tab.id)}
                  className={`flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-bold whitespace-nowrap transition-all duration-200 ${isActive
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

      {/* FE-07.3: Real-Time Log Query Input Box Bound to URL Search Parameters */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-sm flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="w-full sm:max-w-md">
          <InputField
            id="logQuery"
            name="logQuery"
            value={searchQuery}
            onChange={handleQueryChange}
            placeholder="Search logs or filter parameters (e.g. auth, warn, system)..."
            leftIcon={<Search className="w-4 h-4" />}
          />
        </div>
        <div className="flex items-center gap-2 text-xs font-semibold text-slate-500 self-end sm:self-center shrink-0">
          <Filter className="w-3.5 h-3.5 text-blue-600" />
          <span>Active Query Param:</span>
          <code className="bg-slate-100 px-2 py-1 rounded text-blue-600 font-mono font-bold">
            {searchQuery ? `?query=${encodeURIComponent(searchQuery)}` : "None"}
          </code>
        </div>
      </div>

      {/* Dynamic Panel Content */}
      <div className="bg-white p-5 sm:p-6 rounded-2xl border border-slate-200/80 shadow-sm min-h-[300px]">
        {activeTab === "overview" && (
          <div className="space-y-3">
            <h2 className="text-lg font-bold text-slate-800">
              Workspace Overview Panel
            </h2>

            <p className="text-xs text-slate-500">
              Active URL coordinate:{" "}
              <code className="bg-slate-100 px-2 py-0.5 rounded text-blue-600 font-mono">
                ?tab=overview
              </code>
            </p>

            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 pt-4">
              <div className="bg-blue-50/50 p-4 rounded-xl border border-blue-100">
                <span className="text-[10px] uppercase font-bold text-blue-600">
                  Total Requests
                </span>
                <p className="text-xl font-extrabold text-slate-800 mt-1">
                  1,248,900
                </p>
              </div>

              <div className="bg-emerald-50/50 p-4 rounded-xl border border-emerald-100">
                <span className="text-[10px] uppercase font-bold text-emerald-600">
                  System Health
                </span>
                <p className="text-xl font-extrabold text-slate-800 mt-1">
                  99.98%
                </p>
              </div>

              <div className="bg-purple-50/50 p-4 rounded-xl border border-purple-100 sm:col-span-2 md:col-span-1">
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
            <h2 className="text-lg font-bold text-slate-800">
              Real-time Telemetry Analytics
            </h2>

            <p className="text-xs text-slate-500">
              Active URL coordinate:{" "}
              <code className="bg-slate-100 px-2 py-0.5 rounded text-blue-600 font-mono">
                ?tab=analytics
              </code>
            </p>

            <div className="p-4 bg-slate-50 border border-slate-200 rounded-xl font-mono text-xs text-slate-600">
              [Telemetry Tracker]: Streaming incoming bandwidth and payload
              sizes...
            </div>
          </div>
        )}

        {activeTab === "activity" && (
          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <h2 className="text-lg font-bold text-slate-800">
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
                        className={`text-[10px] font-bold px-1.5 py-0.5 rounded ${log.level === "INFO"
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
            <h2 className="text-lg font-bold text-slate-800">
              Export & Audit Reports
            </h2>

            <p className="text-xs text-slate-500">
              Active URL coordinate:{" "}
              <code className="bg-slate-100 px-2 py-0.5 rounded text-blue-600 font-mono">
                ?tab=reports
              </code>
            </p>

            <div className="p-4 bg-slate-50 border border-slate-200 rounded-xl font-mono text-xs text-slate-600">
              [Audit Security]: Compliance security scan passed with 0
              vulnerabilities.
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
import React, { useState, useCallback } from "react";
import { 
  User, 
  Settings as SettingsIcon, 
  ShieldAlert, 
  Save, 
  RefreshCw 
} from "lucide-react";

export default function SettingsOptionsPanel() {
  
  const [displayName, setDisplayName] = useState("Dev");
  const [contactEmail, setContactEmail] = useState("saksdev@mekari.co.in");
  
  // System Configurations States
  const [environmentMode, setEnvironmentMode] = useState<"development" | "staging" | "production">("development");
  const [maxRateLimit, setMaxRateLimit] = useState<number>(1000);
  
  // Security & Toggles States
  const [emailAlertsEnabled, setEmailAlertsEnabled] = useState(true);
  const [systemLogsEnabled, setSystemLogsEnabled] = useState(false);

  // --- Handlers for Input Mutations ---
  const handleNameChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    setDisplayName(e.target.value);
  }, []);

  const handleEmailChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    setContactEmail(e.target.value);
  }, []);

  const handleEnvChange = useCallback((e: React.ChangeEvent<HTMLSelectElement>) => {
    setEnvironmentMode(e.target.value as "development" | "staging" | "production");
  }, []);

  const handleRateLimitChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    setMaxRateLimit(Number(e.target.value));
  }, []);

  const handleEmailToggle = useCallback(() => {
    setEmailAlertsEnabled(prev => !prev);
  }, []);

  const handleLogsToggle = useCallback(() => {
    setSystemLogsEnabled(prev => !prev);
  }, []);

  const handleReset = useCallback(() => {
    setDisplayName("Dev");
    setContactEmail("saksdev@mekari.co.in");
    setEnvironmentMode("development");
    setMaxRateLimit(1000);
    setEmailAlertsEnabled(true);
    setSystemLogsEnabled(false);
  }, []);

  return (
    <div className="w-full max-w-5xl mx-auto p-6 space-y-6">
      {/* Header section */}
      <div className="flex justify-between items-center pb-5 border-b border-slate-200">
        <div>
          <h2 className="text-xl font-bold text-slate-800">System Preferences</h2>
          <p className="text-xs text-slate-400 mt-1">Configure and manage workspace preferences, security flags, and profile identities.</p>
        </div>
        <button 
          onClick={handleReset}
          className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-slate-600 bg-slate-100 hover:bg-slate-200 rounded-lg active:scale-95 transition-all"
        >
          <RefreshCw className="w-3.5 h-3.5" />
          <span>Restore Defaults</span>
        </button>
      </div>

      {/* Main Grid Options Panel */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        
        {/* Section 1: Profile & Identity */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-sm flex flex-col justify-between space-y-4">
          <div>
            <div className="flex items-center gap-2 text-slate-700 font-bold text-sm mb-4">
              <User className="w-4 h-4 text-blue-600" />
              <span>Developer Identity</span>
            </div>
            
            <div className="space-y-3">
              <div>
                <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1.5">
                  Display Name
                </label>
                <input 
                  type="text" 
                  value={displayName}
                  onChange={handleNameChange}
                  className="w-full px-3 py-2 text-sm border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/25 focus:border-blue-500 transition-all text-slate-800 font-medium"
                  placeholder="John Doe"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1.5">
                  Contact Email
                </label>
                <input 
                  type="email" 
                  value={contactEmail}
                  onChange={handleEmailChange}
                  className="w-full px-3 py-2 text-sm border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/25 focus:border-blue-500 transition-all text-slate-800 font-medium"
                  placeholder="developer@domain.com"
                />
              </div>
            </div>
          </div>
          
          <p className="text-[10px] text-slate-400">Updates profile identity and access values across central environments.</p>
        </div>

        {/* Section 2: System Settings */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-sm flex flex-col justify-between space-y-4">
          <div>
            <div className="flex items-center gap-2 text-slate-700 font-bold text-sm mb-4">
              <SettingsIcon className="w-4 h-4 text-purple-600" />
              <span>Workspace Configurations</span>
            </div>
            
            <div className="space-y-3">
              <div>
                <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1.5">
                  Environment Mode
                </label>
                <select 
                  value={environmentMode}
                  onChange={handleEnvChange}
                  className="w-full px-3 py-2 text-sm border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500/25 focus:border-purple-500 bg-white transition-all text-slate-800 font-medium"
                >
                  <option value="development">Development Sandbox</option>
                  <option value="staging">Staging Environment</option>
                  <option value="production">Production Release</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1.5">
                  Max API Rate Limit (req/min)
                </label>
                <input 
                  type="number" 
                  value={maxRateLimit}
                  onChange={handleRateLimitChange}
                  className="w-full px-3 py-2 text-sm border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500/25 focus:border-purple-500 transition-all text-slate-800 font-medium"
                  min="0"
                />
              </div>
            </div>
          </div>

          <p className="text-[10px] text-slate-400">Dynamic state variables adapt and lock based on server constraints.</p>
        </div>

        {/* Section 3: Feature Toggles & Security Rules */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-sm md:col-span-2 flex flex-col md:flex-row md:items-center md:justify-between gap-6">
          <div className="flex-1">
            <div className="flex items-center gap-2 text-slate-700 font-bold text-sm mb-3">
              <ShieldAlert className="w-4 h-4 text-emerald-600" />
              <span>Security Operations</span>
            </div>
            <p className="text-xs text-slate-400 max-w-xl">
              Enable active communication streams or verbose database logging triggers to safeguard state data transfers.
            </p>
          </div>

          {/* Toggle Switches */}
          <div className="flex flex-col sm:flex-row gap-4 sm:gap-8 shrink-0">
            {/* Toggle 1 */}
            <div className="flex items-center gap-3">
              <button 
                onClick={handleEmailToggle}
                className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-300 ease-in-out focus:outline-none ${
                  emailAlertsEnabled ? "bg-emerald-500" : "bg-slate-200"
                }`}
              >
                <span 
                  className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition-transform duration-300 ease-in-out ${
                    emailAlertsEnabled ? "translate-x-5" : "translate-x-0"
                  }`} 
                />
              </button>
              <span className="text-xs font-semibold text-slate-600">Email Alerts</span>
            </div>

            {/* Toggle 2 */}
            <div className="flex items-center gap-3">
              <button 
                onClick={handleLogsToggle}
                className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-300 ease-in-out focus:outline-none ${
                  systemLogsEnabled ? "bg-emerald-500" : "bg-slate-200"
                }`}
              >
                <span 
                  className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition-transform duration-300 ease-in-out ${
                    systemLogsEnabled ? "translate-x-5" : "translate-x-0"
                  }`} 
                />
              </button>
              <span className="text-xs font-semibold text-slate-600">Security Logging</span>
            </div>
          </div>
        </div>

      </div>

      {/* Save Button Container */}
      <div className="flex justify-end pt-2">
        <button 
          className="flex items-center gap-2 px-6 py-2.5 text-sm font-bold text-white bg-blue-600 rounded-xl hover:bg-blue-700 shadow-md shadow-blue-500/10 active:scale-95 transition-all"
        >
          <Save className="w-4 h-4" />
          <span>Save Changes</span>
        </button>
      </div>
    </div>
  );
}

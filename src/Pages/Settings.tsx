import React, { useState, useCallback } from "react";
import {
  User,
  Settings as SettingsIcon,
  ShieldAlert,
  Save,
  RefreshCw,
  Info
} from "lucide-react";

type EnvironmentType = "development" | "staging" | "production";

interface ValidationErrors {
  displayName?: string;
  contactEmail?: string;
  maxRateLimit?: string;
}

export default function SettingsOptionsPanel() {
  const [displayName, setDisplayName] = useState("Dev");
  const [contactEmail, setContactEmail] = useState("saksdev@mekari.co.in");
  const [environmentMode, setEnvironmentMode] = useState<EnvironmentType>("development");
  const [maxRateLimit, setMaxRateLimit] = useState<number>(1000);
  const [emailAlertsEnabled, setEmailAlertsEnabled] = useState(true);
  const [systemLogsEnabled, setSystemLogsEnabled] = useState(false);

  // --- Local State for Inline Validation Logs (FE-04.1) ---
  const [errors, setErrors] = useState<ValidationErrors>({});

  // Dynamic Validation System
  const validateField = useCallback((name: string, value: string | number) => {
    setErrors((prev) => {
      const nextErrors = { ...prev };

      if (name === "displayName") {
        const strVal = String(value);
        if (!strVal.trim()) {
          nextErrors.displayName = "Display Name cannot be empty.";
        } else if (strVal.trim().length < 3) {
          nextErrors.displayName = "Display Name must be at least 3 characters.";
        } else {
          delete nextErrors.displayName;
        }
      }

      if (name === "contactEmail") {
        const strVal = String(value);
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!strVal.trim()) {
          nextErrors.contactEmail = "Email address cannot be empty.";
        } else if (!emailRegex.test(strVal)) {
          nextErrors.contactEmail = "Please enter a valid email address.";
        } else {
          delete nextErrors.contactEmail;
        }
      }

      if (name === "maxRateLimit") {
        const numVal = Number(value);
        if (isNaN(numVal) || numVal < 1) {
          nextErrors.maxRateLimit = "Rate limit must be a positive integer.";
        } else if (numVal > 10000) {
          nextErrors.maxRateLimit = "Rate limit cannot exceed 10,000 req/min.";
        } else {
          delete nextErrors.maxRateLimit;
        }
      }

      return nextErrors;
    });
  }, []);

  const handleNameChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    setDisplayName(val);
    validateField("displayName", val);
  }, [validateField]);

  const handleEmailChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    setContactEmail(val);
    validateField("contactEmail", val);
  }, [validateField]);

  const handleRateLimitChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    setMaxRateLimit(Number(val));
    validateField("maxRateLimit", val);
  }, [validateField]);

  const handleEnvChange = useCallback((e: React.ChangeEvent<HTMLSelectElement>) => {
    const rawValue = e.target.value;
    const validEnvironments: EnvironmentType[] = ["development", "staging", "production"];
    const parsedEnv = validEnvironments.find(env => env === rawValue);

    if (!parsedEnv) {
      console.error(`Security Warning: Safe parsing rejected input value "${rawValue}"`);
      return;
    }

    setEnvironmentMode(parsedEnv);

    // Apply default rate limits and validate
    let targetLimit = 1000;
    if (parsedEnv === "production") {
      targetLimit = 5000;
      setSystemLogsEnabled(true);
    } else if (parsedEnv === "staging") {
      targetLimit = 2500;
      setSystemLogsEnabled(true);
    } else {
      targetLimit = 1000;
      setSystemLogsEnabled(false);
    }
    setMaxRateLimit(targetLimit);
    validateField("maxRateLimit", targetLimit);
  }, [validateField]);

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
    setErrors({});
  }, []);

  // --- Submit Availability Rules & Submit Callback (FE-04.2) ---
  const isFormInvalid =
    Object.keys(errors).length > 0 ||
    !displayName.trim() ||
    !contactEmail.trim() ||
    maxRateLimit < 1;

  const handleSubmit = useCallback((e: React.FormEvent) => {
    e.preventDefault();
    if (isFormInvalid) return;
    console.log("Saving Workspace preferences...", {
      displayName,
      contactEmail,
      environmentMode,
      maxRateLimit,
      emailAlertsEnabled,
      systemLogsEnabled
    });
  }, [isFormInvalid, displayName, contactEmail, environmentMode, maxRateLimit, emailAlertsEnabled, systemLogsEnabled]);

  return (
    <form onSubmit={handleSubmit} className="w-full max-w-5xl mx-auto p-6 space-y-6">
      <div className="flex justify-between items-center pb-5 border-b border-slate-200">
        <div>
          <h2 className="text-xl font-bold text-slate-800">System Preferences</h2>
          <p className="text-xs text-slate-400 mt-1">Configure and manage workspace preferences, security flags, and profile identities.</p>
        </div>
        <button
          type="button"
          onClick={handleReset}
          className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-slate-600 bg-slate-100 hover:bg-slate-200 rounded-lg active:scale-95 transition-all"
        >
          <RefreshCw className="w-3.5 h-3.5" />
          <span>Restore Defaults</span>
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-sm flex flex-col justify-between space-y-4">
          <div>
            <div className="flex items-center gap-2 text-slate-700 font-bold text-sm mb-4">
              <User className="w-4 h-4 text-blue-600" />
              <span>Developer Identity</span>
            </div>
            <div className="space-y-3">
              <div>
                <label htmlFor="displayName" className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1.5">
                  Display Name
                </label>
                <input
                  id="displayName"
                  name="displayName"
                  type="text"
                  value={displayName}
                  onChange={handleNameChange}
                  className={`w-full px-3 py-2 text-sm border rounded-xl focus:outline-none focus:ring-2 transition-all text-slate-800 font-medium ${errors.displayName
                      ? "border-red-300 focus:ring-red-500/25 focus:border-red-500"
                      : "border-slate-200 focus:ring-blue-500/25 focus:border-blue-500"
                    }`}
                  placeholder="John Doe"
                />
                {errors.displayName && (
                  <p className="text-[11px] text-red-600 font-semibold mt-1">{errors.displayName}</p>
                )}
              </div>
              <div>
                <label htmlFor="contactEmail" className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1.5">
                  Contact Email
                </label>
                <input
                  id="contactEmail"
                  name="contactEmail"
                  type="email"
                  value={contactEmail}
                  onChange={handleEmailChange}
                  className={`w-full px-3 py-2 text-sm border rounded-xl focus:outline-none focus:ring-2 transition-all text-slate-800 font-medium ${errors.contactEmail
                      ? "border-red-300 focus:ring-red-500/25 focus:border-red-500"
                      : "border-slate-200 focus:ring-blue-500/25 focus:border-blue-500"
                    }`}
                  placeholder="developer@domain.com"
                />
                {errors.contactEmail && (
                  <p className="text-[11px] text-red-600 font-semibold mt-1">{errors.contactEmail}</p>
                )}
              </div>
            </div>
          </div>
          <p className="text-[10px] text-slate-400">Updates profile identity and access values across central environments.</p>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-sm flex flex-col justify-between space-y-4">
          <div>
            <div className="flex items-center gap-2 text-slate-700 font-bold text-sm mb-4">
              <SettingsIcon className="w-4 h-4 text-purple-600" />
              <span>Workspace Configurations</span>
            </div>
            <div className="space-y-3">
              <div>
                <label htmlFor="environmentMode" className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1.5">
                  Environment Mode
                </label>
                <select
                  id="environmentMode"
                  name="environmentMode"
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
                <label htmlFor="maxRateLimit" className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1.5">
                  Max API Rate Limit (req/min)
                </label>
                <input
                  id="maxRateLimit"
                  name="maxRateLimit"
                  type="number"
                  value={maxRateLimit}
                  onChange={handleRateLimitChange}
                  className={`w-full px-3 py-2 text-sm border rounded-xl focus:outline-none focus:ring-2 transition-all text-slate-800 font-medium ${errors.maxRateLimit
                      ? "border-red-300 focus:ring-red-500/25 focus:border-red-500"
                      : "border-slate-200 focus:ring-purple-500/25 focus:border-purple-500"
                    }`}
                  min="0"
                />
                {errors.maxRateLimit && (
                  <p className="text-[11px] text-red-600 font-semibold mt-1">{errors.maxRateLimit}</p>
                )}
              </div>
            </div>
          </div>
          <div className="flex items-start gap-2 bg-slate-50 p-2.5 rounded-lg border border-slate-100 mt-2">
            <Info className="w-3.5 h-3.5 text-blue-500 shrink-0 mt-0.5" />
            <p className="text-[10px] text-slate-500 leading-normal">
              Rate Limit adjusted automatically based on Environment Mode: Production (5000), Staging (2500), Development (1000).
            </p>
          </div>
        </div>

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
          <div className="flex flex-col sm:flex-row gap-4 sm:gap-8 shrink-0">
            <div className="flex items-center gap-3">
              <button
                type="button"
                onClick={handleEmailToggle}
                className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-300 ease-in-out focus:outline-none ${emailAlertsEnabled ? "bg-emerald-500" : "bg-slate-200"
                  }`}
              >
                <span
                  className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition-transform duration-300 ease-in-out ${emailAlertsEnabled ? "translate-x-5" : "translate-x-0"
                    }`}
                />
              </button>
              <span className="text-xs font-semibold text-slate-600">Email Alerts</span>
            </div>
            <div className="flex items-center gap-3">
              <button
                type="button"
                onClick={handleLogsToggle}
                className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-300 ease-in-out focus:outline-none ${systemLogsEnabled ? "bg-emerald-500" : "bg-slate-200"
                  }`}
              >
                <span
                  className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition-transform duration-300 ease-in-out ${systemLogsEnabled ? "translate-x-5" : "translate-x-0"
                    }`}
                />
              </button>
              <span className="text-xs font-semibold text-slate-600">Security Logging</span>
            </div>
          </div>
        </div>
      </div>

      <div className="flex justify-end pt-2">
        <button
          type="submit"
          disabled={isFormInvalid}
          className={`flex items-center gap-2 px-6 py-2.5 text-sm font-bold text-white rounded-xl shadow-md transition-all ${isFormInvalid
              ? "bg-slate-300 text-slate-500 cursor-not-allowed shadow-none"
              : "bg-blue-600 hover:bg-blue-700 shadow-blue-500/10 active:scale-95 hover:shadow-lg"
            }`}
        >
          <Save className="w-4 h-4" />
          <span>Save Changes</span>
        </button>
      </div>
    </form>
  );
}

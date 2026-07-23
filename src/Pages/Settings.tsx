import React, { useState, useCallback, useEffect } from "react";
import {
  User,
  Settings as SettingsIcon,
  ShieldAlert,
  Save,
  RefreshCw,
  Terminal,
  ShieldCheck,
  ShieldX,
  Activity
} from "lucide-react";
import { Button } from "../components/ui/Button";
import { InputField } from "../components/ui/InputField";
import { WorkspaceCard } from "../components/ui/WorkspaceCard";
import { useWorkspace, type EnvironmentType } from "../context/WorkspaceContext";
import apiClient from "../api/apiClient";

interface ValidationErrors {
  displayName?: string;
  contactEmail?: string;
  maxRateLimit?: string;
}

export default function SettingsOptionsPanel() {
  const {
    records,
    isLoading,
    updateProfile,
    updateEnvironment,
    updateRateLimit,
    toggleEmailAlerts,
    toggleSystemLogs,
    restoreDefaults,
    addToast,
  } = useWorkspace();

  const [displayName, setDisplayName] = useState(records.displayName);
  const [contactEmail, setContactEmail] = useState(records.contactEmail);
  const [environmentMode, setEnvironmentMode] = useState<EnvironmentType>(records.environmentMode);
  const [maxRateLimit, setMaxRateLimit] = useState<number>(records.maxRateLimit);
  const [errors, setErrors] = useState<ValidationErrors>({});

  // FE-12.4: Latency profiling sandbox states
  const [latency, setLatency] = useState<number | null>(null);
  const [latencyStatus, setLatencyStatus] = useState<"idle" | "testing" | "success" | "error">("idle");
  const [errorLog, setErrorLog] = useState<string>("");

  // FE-10.1: Synchronize local state with global workspace store records when store updates
  useEffect(() => {
    setDisplayName(records.displayName);
    setContactEmail(records.contactEmail);
    setEnvironmentMode(records.environmentMode);
    setMaxRateLimit(records.maxRateLimit);
  }, [records.displayName, records.contactEmail, records.environmentMode, records.maxRateLimit]);

  /**
   * Strips HTML tags and inline scripts from raw text inputs to prevent XSS attacks.
   */
  const sanitizeString = useCallback((val: string): string => {
    let clean = val.trim();
    clean = clean.replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, "");
    clean = clean.replace(/<[^>]*>/g, "");
    return clean;
  }, []);

  const [sandboxInput, setSandboxInput] = useState("");
  const [sandboxSanitized, setSandboxSanitized] = useState("");
  const [sandboxStatus, setSandboxStatus] = useState<"clean" | "warning">("clean");

  /**
   * Handles input changes in the stress test console and updates sanitization logs.
   */
  const handleSandboxInputChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const rawVal = e.target.value;
    setSandboxInput(rawVal);

    const cleanVal = sanitizeString(rawVal);
    setSandboxSanitized(cleanVal);

    if (rawVal !== cleanVal || (rawVal && !rawVal.trim())) {
      setSandboxStatus("warning");
    } else {
      setSandboxStatus("clean");
    }
  }, [sanitizeString]);

  /**
   * Validates form inputs against schema rules and updates real-time error states.
   */
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

  /**
   * Handles changes to the display name field and triggers real-time field validation.
   */
  const handleNameChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    setDisplayName(val);
    validateField("displayName", val);
  }, [validateField]);

  /**
   * Handles changes to the contact email field and validates format against regex rules.
   */
  const handleEmailChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    setContactEmail(val);
    validateField("contactEmail", val);
  }, [validateField]);

  /**
   * Handles changes to the environment mode dropdown selector.
   */
  const handleEnvChange = useCallback((e: React.ChangeEvent<HTMLSelectElement>) => {
    const rawValue = e.target.value;
    const validEnvironments: EnvironmentType[] = ["development", "staging", "production"];
    const parsedEnv = validEnvironments.find(env => env === rawValue);

    if (!parsedEnv) {
      console.error(`Security Warning: Safe parsing rejected input value "${rawValue}"`);
      return;
    }

    setEnvironmentMode(parsedEnv);
    updateEnvironment(parsedEnv);

    let targetLimit = 1000;
    if (parsedEnv === "production") {
      targetLimit = 5000;
    } else if (parsedEnv === "staging") {
      targetLimit = 2500;
    }
    setMaxRateLimit(targetLimit);
    validateField("maxRateLimit", targetLimit);
  }, [updateEnvironment, validateField]);

  /**
   * Handles changes to the max rate limit field and validates input constraints.
   */
  const handleRateLimitChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const rawVal = e.target.value;
    const numVal = parseInt(rawVal, 10);
    setMaxRateLimit(isNaN(numVal) ? 0 : numVal);
    validateField("maxRateLimit", rawVal);
  }, [validateField]);

  /**
   * Dispatches email notification setting toggle to the central store.
   */
  const handleEmailToggle = useCallback(() => {
    toggleEmailAlerts();
  }, [toggleEmailAlerts]);

  /**
   * Dispatches security logs setting toggle to the central store.
   */
  const handleLogsToggle = useCallback(() => {
    toggleSystemLogs();
  }, [toggleSystemLogs]);

  const isFormInvalid =
    Object.keys(errors).length > 0 ||
    !displayName.trim() ||
    !contactEmail.trim() ||
    maxRateLimit < 1;

  /**
   * Handles settings form submission, dispatches action mutators to central store.
   */
  const handleSubmit = useCallback((e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (isFormInvalid) return;

    const safeName = sanitizeString(displayName);
    const safeEmail = sanitizeString(contactEmail);

    setErrors({}); // Reset local errors before submit

    const isProfileDirty = safeName !== records.displayName || safeEmail !== records.contactEmail;
    const isRateLimitDirty = maxRateLimit !== records.maxRateLimit;

    const promises: Promise<any>[] = [];

    if (isProfileDirty) {
      promises.push(updateProfile(safeName, safeEmail));
    }

    if (isRateLimitDirty) {
      promises.push(updateRateLimit(maxRateLimit));
    }

    if (promises.length === 0) {
      addToast("No changes detected in profile settings.", "warning");
      return;
    }

    Promise.all(promises)
      .catch((err) => {
        if (err.response && err.response.data && err.response.data.errors) {
          setErrors((prev) => ({
            ...prev,
            ...err.response.data.errors,
          }));
        }
      });
  }, [isFormInvalid, displayName, contactEmail, maxRateLimit, records.displayName, records.contactEmail, records.maxRateLimit, sanitizeString, updateProfile, updateRateLimit, addToast]);

  // FE-12.4: Latency diagnostic profiling trigger
  const testLatency = useCallback(async () => {
    setLatencyStatus("testing");
    setErrorLog("");
    const startTime = performance.now();
    try {
      await apiClient.get("/api/workspace");
      const duration = Math.round(performance.now() - startTime);
      setLatency(duration);
      setLatencyStatus("success");
    } catch (err: any) {
      setLatencyStatus("error");
      setErrorLog(err.message || "Failed to reach mock server.");
    }
  }, []);

  // FE-12.4: Test expired token 401 response interceptor
  const triggerError401 = useCallback(async () => {
    setErrorLog("");
    try {
      await apiClient.get("/api/trigger-401");
    } catch {
      setErrorLog("[401 Intercepted]: Access expired warning logged to browser console.");
    }
  }, []);

  // FE-12.4: Test server failure 500 response interceptor
  const triggerError500 = useCallback(async () => {
    setErrorLog("");
    try {
      await apiClient.get("/api/trigger-500");
    } catch {
      setErrorLog("[500 Intercepted]: Central server error diagnostic logged to browser console.");
    }
  }, []);

  return (
    <form onSubmit={handleSubmit} className="w-full space-y-3">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">

        <WorkspaceCard
          title="Profile Settings"
          description="Update your workspace identity details and administrator contact emails."
          icon={<User className="w-5 h-5 text-indigo-500" />}
        >
          <div className="space-y-3">
            <InputField
              id="displayName"
              name="displayName"
              label="Display Name"
              type="text"
              value={displayName}
              onChange={handleNameChange}
              error={errors.displayName}
              placeholder="e.g. Production Cluster"
              disabled={isLoading}
            />

            <InputField
              id="contactEmail"
              name="contactEmail"
              label="Administrator Email"
              type="email"
              value={contactEmail}
              onChange={handleEmailChange}
              error={errors.contactEmail}
              placeholder="e.g. admin@mekari.co.in"
              disabled={isLoading}
            />
          </div>
        </WorkspaceCard>

        <WorkspaceCard
          title="System Architecture"
          description="Adjust runtime environments and API rate threshold parameters."
          icon={<SettingsIcon className="w-5 h-5 text-indigo-500" />}
          headerAction={
            <button
              type="button"
              onClick={restoreDefaults}
              disabled={isLoading}
              className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg border border-slate-200 hover:bg-slate-50 text-slate-600 transition-colors text-xs font-semibold"
            >
              <RefreshCw className="w-3.5 h-3.5" />
              Restore
            </button>
          }
        >
          <div className="space-y-3">
            <div>
              <label htmlFor="environmentMode" className="block text-xs font-bold text-slate-700 mb-1.5">
                Runtime Environment
              </label>
              <select
                id="environmentMode"
                name="environmentMode"
                value={environmentMode}
                onChange={handleEnvChange}
                disabled={isLoading}
                className="w-full px-3.5 py-2.5 text-sm bg-white border border-slate-200 rounded-xl focus:outline-none focus:border-indigo-500 text-slate-700 transition-all font-medium"
              >
                <option value="development">Development Mode</option>
                <option value="staging">Staging Sandbox</option>
                <option value="production">Production Environment</option>
              </select>
            </div>

            <InputField
              id="maxRateLimit"
              name="maxRateLimit"
              label="Max Rate Limit (req/min)"
              type="number"
              value={maxRateLimit}
              onChange={handleRateLimitChange}
              error={errors.maxRateLimit}
              placeholder="e.g. 5000"
              disabled={isLoading}
            />
          </div>
        </WorkspaceCard>

        <WorkspaceCard
          title="Security Rules"
          description="Toggle automated threat alerts and configure central logging triggers."
          icon={<ShieldAlert className="w-5 h-5 text-indigo-500" />}
        >
          <div className="space-y-4 py-1">
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <span className="text-sm font-semibold text-slate-800">Email Alerts</span>
                <p className="text-xs text-slate-500">Dispatch alerts for validation checks</p>
              </div>
              <button
                id="emailAlertsToggle"
                type="button"
                onClick={handleEmailToggle}
                disabled={isLoading}
                className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${
                  records.emailAlertsEnabled ? "bg-indigo-600" : "bg-slate-200"
                }`}
              >
                <span
                  className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${
                    records.emailAlertsEnabled ? "translate-x-5" : "translate-x-0"
                  }`}
                />
              </button>
            </div>

            <div className="flex items-center justify-between border-t border-slate-100 pt-4">
              <div className="space-y-0.5">
                <span className="text-sm font-semibold text-slate-800">Security Logging</span>
                <p className="text-xs text-slate-500">Log runtime changes to system console</p>
              </div>
              <button
                id="securityLoggingToggle"
                type="button"
                onClick={handleLogsToggle}
                disabled={isLoading}
                className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${
                  records.systemLogsEnabled ? "bg-indigo-600" : "bg-slate-200"
                }`}
              >
                <span
                  className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${
                    records.systemLogsEnabled ? "translate-x-5" : "translate-x-0"
                  }`}
                />
              </button>
            </div>
          </div>
        </WorkspaceCard>

        {/* Edge-Case Inputs Sandbox */}
        <div className="bg-slate-900 p-4 sm:p-5 rounded-2xl border border-slate-800 space-y-3.5 shadow-inner">
          <div className="flex items-center justify-between pb-2.5 border-b border-slate-800">
            <div className="flex items-center gap-2">
              <Terminal className="w-4 h-4 text-amber-500" />
              <span className="text-xs font-bold text-slate-200 font-mono">Edge-Case Inputs Sandbox</span>
            </div>
            <div className="flex items-center gap-1.5 px-2 py-0.5 rounded bg-slate-800/80 text-[10px] font-bold font-mono">
              {sandboxStatus === "clean" ? (
                <>
                  <ShieldCheck className="w-3 h-3 text-emerald-500" />
                  <span className="text-emerald-500">Secured Input</span>
                </>
              ) : (
                <>
                  <ShieldX className="w-3 h-3 text-amber-500" />
                  <span className="text-amber-500">Sanitizer Intercepted</span>
                </>
              )}
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label htmlFor="sandboxInput" className="block text-[10px] font-bold text-slate-400 font-mono uppercase tracking-wider mb-1.5">
                Stress Test Box (Paste tags/scripts/spaces)
              </label>
              <input
                id="sandboxInput"
                name="sandboxInput"
                type="text"
                value={sandboxInput}
                onChange={handleSandboxInputChange}
                className="w-full px-3 py-2 text-xs bg-slate-950 border border-slate-800 rounded-xl focus:outline-none focus:border-amber-500 font-mono text-slate-300"
                placeholder="e.g. <script>alert(1)</script>   "
              />
            </div>

            <div className="space-y-2">
              <span className="block text-[10px] font-bold text-slate-400 font-mono uppercase tracking-wider">
                Sanitization Output Log
              </span>
              <div className="w-full min-h-[38px] px-3 py-2 bg-slate-950 rounded-xl border border-slate-850 font-mono text-xs flex items-center">
                {sandboxSanitized ? (
                  <span className="text-emerald-400">{sandboxSanitized}</span>
                ) : sandboxInput ? (
                  <span className="text-slate-600 italic">[Empty String Output]</span>
                ) : (
                  <span className="text-slate-600 italic">Console idle...</span>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* FE-12.4: Network Connectivity Testing Sandbox */}
        <div className="bg-slate-900 p-4 sm:p-5 rounded-2xl border border-slate-800 md:col-span-2 space-y-3.5 shadow-inner">
          <div className="flex items-center justify-between pb-2.5 border-b border-slate-800">
            <div className="flex items-center gap-2">
              <Activity className="w-4 h-4 text-emerald-500" />
              <span className="text-xs font-bold text-slate-200 font-mono">Network Connectivity Sandbox</span>
            </div>
            <div className="flex items-center gap-1.5 px-2 py-0.5 rounded bg-slate-800/80 text-[10px] font-bold font-mono text-emerald-400">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse"></span>
              MSW MOCK API ONLINE
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <button
              type="button"
              onClick={testLatency}
              disabled={latencyStatus === "testing"}
              className="flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl border border-slate-750 bg-slate-800 text-slate-100 hover:bg-slate-700/80 md:active:scale-95 disabled:opacity-50 disabled:pointer-events-none transition-all duration-200 text-xs font-bold font-mono tracking-wide shadow-lg shadow-slate-950/20 cursor-pointer"
            >
              <RefreshCw className={`w-3.5 h-3.5 text-blue-400 ${latencyStatus === "testing" ? "animate-spin" : ""}`} />
              <span>Test Latency</span>
            </button>
            <button
              type="button"
              onClick={triggerError401}
              className="flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl border border-amber-500/20 bg-amber-500/10 text-amber-400 hover:bg-amber-500/20 md:active:scale-95 transition-all duration-200 text-xs font-bold font-mono tracking-wide shadow-md shadow-amber-950/10 cursor-pointer"
            >
              <ShieldAlert className="w-3.5 h-3.5 text-amber-400" />
              <span>Trigger 401 Intercept</span>
            </button>
            <button
              type="button"
              onClick={triggerError500}
              className="flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl border border-rose-500/20 bg-rose-500/10 text-rose-400 hover:bg-rose-500/20 md:active:scale-95 transition-all duration-200 text-xs font-bold font-mono tracking-wide shadow-md shadow-rose-950/10 cursor-pointer"
            >
              <ShieldX className="w-3.5 h-3.5 text-rose-400" />
              <span>Trigger 500 Intercept</span>
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-1">
            <div className="bg-slate-950 p-3 rounded-xl border border-slate-850 font-mono text-xs space-y-1">
              <span className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider">Payload Metrics</span>
              <div className="flex justify-between text-slate-350">
                <span>Intercept Mode:</span>
                <span className="text-emerald-400 font-bold">Service Worker</span>
              </div>
              <div className="flex justify-between text-slate-350">
                <span>Latency Ping:</span>
                <span className={latencyStatus === "testing" ? "text-amber-400" : "text-slate-200"}>
                  {latencyStatus === "testing" ? "Measuring..." : latency !== null ? `${latency} ms` : "Not Tested"}
                </span>
              </div>
            </div>

            <div className="bg-slate-950 p-3 rounded-xl border border-slate-850 font-mono text-xs space-y-1">
              <span className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider">Sandbox Logs</span>
              <div className="text-slate-400 italic">
                {errorLog ? (
                  <span className={errorLog.includes("500") ? "text-red-400" : "text-amber-400"}>{errorLog}</span>
                ) : (
                  "Ready to profile connections..."
                )}
              </div>
            </div>
          </div>
        </div>

      </div>

      <div className="flex justify-end pt-1 items-center gap-3">
        {isLoading && (
          <div className="flex items-center gap-2 text-xs text-amber-500 font-mono animate-pulse">
            <RefreshCw className="w-3.5 h-3.5 animate-spin" />
            Synchronizing with mock server...
          </div>
        )}
        <Button
          type="submit"
          disabled={isFormInvalid || isLoading}
          leftIcon={!isLoading && <Save className="w-4.5 h-4.5" />}
          className="px-6 py-2.5"
        >
          {isLoading ? "Saving..." : "Save Changes"}
        </Button>
      </div>
    </form>
  );
}

import React, { useState, useCallback } from "react";
import {
  User,
  Settings as SettingsIcon,
  ShieldAlert,
  Save,
  RefreshCw,
  Info,
  Terminal,
  ShieldCheck,
  ShieldX
} from "lucide-react";
import { Button } from "../components/ui/Button";
import { InputField } from "../components/ui/InputField";
import { WorkspaceCard } from "../components/ui/WorkspaceCard";

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
  const [errors, setErrors] = useState<ValidationErrors>({});

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
   * Handles changes to the maximum API rate limit field and validates numeric bounds.
   */
  const handleRateLimitChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    setMaxRateLimit(Number(val));
    validateField("maxRateLimit", val);
  }, [validateField]);

  /**
   * Handles environment mode selection and updates rate limits automatically based on mode.
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

  /**
   * Toggles real-time email notification alert preferences.
   */
  const handleEmailToggle = useCallback(() => {
    setEmailAlertsEnabled(prev => !prev);
  }, []);

  /**
   * Toggles active security logging operations state.
   */
  const handleLogsToggle = useCallback(() => {
    setSystemLogsEnabled(prev => !prev);
  }, []);

  /**
   * Restores all workspace settings, input fields, and errors back to default values.
   */
  const handleReset = useCallback(() => {
    setDisplayName("Dev");
    setContactEmail("saksdev@mekari.co.in");
    setEnvironmentMode("development");
    setMaxRateLimit(1000);
    setEmailAlertsEnabled(true);
    setSystemLogsEnabled(false);
    setErrors({});
    setSandboxInput("");
    setSandboxSanitized("");
    setSandboxStatus("clean");
  }, []);

  const isFormInvalid =
    Object.keys(errors).length > 0 ||
    !displayName.trim() ||
    !contactEmail.trim() ||
    maxRateLimit < 1;

  /**
   * Handles settings form submission, prevents invalid postbacks, and sanitizes input data.
   */
  const handleSubmit = useCallback((e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (isFormInvalid) return;

    const safeName = sanitizeString(displayName);
    const safeEmail = sanitizeString(contactEmail);

    console.log("Saving secured workspace preferences...", {
      displayName: safeName,
      contactEmail: safeEmail,
      environmentMode,
      maxRateLimit,
      emailAlertsEnabled,
      systemLogsEnabled
    });

    setDisplayName(safeName);
    setContactEmail(safeEmail);
  }, [isFormInvalid, displayName, contactEmail, environmentMode, maxRateLimit, emailAlertsEnabled, systemLogsEnabled, sanitizeString]);

  return (
    <form onSubmit={handleSubmit} className="w-full space-y-3">
      <div className="flex justify-between items-center pb-3 border-b border-slate-200">
        <div>
          <h2 className="text-xl font-bold text-slate-800">System Preferences</h2>
          <p className="text-xs text-slate-400 mt-0.5">Configure and manage workspace preferences, security flags, and profile identities.</p>
        </div>
        <Button
          variant="secondary"
          className="text-xs py-1.5 px-3"
          leftIcon={<RefreshCw className="w-3.5 h-3.5" />}
          onClick={handleReset}
        >
          Restore Defaults
        </Button>
      </div>

      <div className="grid grid-cols-1 gap-3 sm:gap-4 md:grid-cols-2">
        <WorkspaceCard
          title="Developer Identity"
          icon={<User className="w-4 h-4 text-blue-600" />}
          description="Updates profile identity and access values across central environments."
        >
          <InputField
            id="displayName"
            name="displayName"
            label="Display Name"
            value={displayName}
            onChange={handleNameChange}
            error={errors.displayName}
            placeholder="John Doe"
          />
          <InputField
            id="contactEmail"
            name="contactEmail"
            label="Contact Email"
            type="email"
            value={contactEmail}
            onChange={handleEmailChange}
            error={errors.contactEmail}
            placeholder="developer@domain.com"
          />
        </WorkspaceCard>

        <WorkspaceCard
          title="Workspace Configurations"
          icon={<SettingsIcon className="w-4 h-4 text-purple-600" />}
          footer={
            <div className="flex items-start gap-2 bg-slate-50 p-2.5 rounded-lg border border-slate-100">
              <Info className="w-3.5 h-3.5 text-blue-500 shrink-0 mt-0.5" />
              <p className="text-[10px] text-slate-500 leading-normal">
                Rate Limit adjusted automatically based on Environment Mode: Production (5000), Staging (2500), Development (1000).
              </p>
            </div>
          }
        >
          <div>
            <label htmlFor="environmentMode" className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1.5 select-none">
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
          <InputField
            id="maxRateLimit"
            name="maxRateLimit"
            label="Max API Rate Limit (req/min)"
            type="number"
            value={maxRateLimit}
            onChange={handleRateLimitChange}
            error={errors.maxRateLimit}
            min="0"
          />
        </WorkspaceCard>

        <WorkspaceCard
          title="Security Operations"
          icon={<ShieldAlert className="w-4 h-4 text-emerald-600" />}
          description="Enable active communication streams or verbose database logging triggers to safeguard state data transfers."
          className="md:col-span-2"
        >
          <div className="flex flex-col sm:flex-row gap-4 sm:gap-8 justify-end">
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
        </WorkspaceCard>

        <div className="bg-slate-900 p-4 sm:p-5 rounded-2xl border border-slate-800 md:col-span-2 space-y-3.5 shadow-inner">
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

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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

      </div>

      <div className="flex justify-end pt-1">
        <Button
          type="submit"
          disabled={isFormInvalid}
          leftIcon={<Save className="w-4.5 h-4.5" />}
          className="px-6 py-2.5"
        >
          Save Changes
        </Button>
      </div>
    </form>
  );
}

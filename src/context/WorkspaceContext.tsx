import React, { createContext, useContext, useState, useCallback, useMemo, useEffect } from "react";
import apiClient, { registerNetworkErrorListener } from "../api/apiClient";

export type EnvironmentType = "development" | "staging" | "production";

export interface LogEntry {
  readonly id: number;
  readonly type: string;
  readonly level: "INFO" | "WARN" | "SUCCESS";
  readonly text: string;
  readonly time: string;
}

export interface ToastMessage {
  readonly id: string;
  readonly message: string;
  readonly type: "success" | "warning" | "error";
}

// Permanent records state structure
export interface PermanentWorkspaceRecords {
  readonly displayName: string;
  readonly contactEmail: string;
  readonly environmentMode: EnvironmentType;
  readonly maxRateLimit: number;
  readonly emailAlertsEnabled: boolean;
  readonly systemLogsEnabled: boolean;
  readonly logs: ReadonlyArray<LogEntry>;
}

// Temporary UI state structure
export interface TemporaryUISwitches {
  readonly isMobileDrawerOpen: boolean;
  readonly activeTab: string;
  readonly searchQuery: string;
}

// Permanent Records State & Mutators (Readonly Protected Data Tree)
export interface WorkspaceContextType {
  readonly records: Readonly<PermanentWorkspaceRecords>;
  readonly isLoading: boolean;
  readonly updateProfile: (displayName: string, contactEmail: string) => Promise<any>;
  readonly updateEnvironment: (environmentMode: EnvironmentType) => Promise<any>;
  readonly updateRateLimit: (limit: number) => Promise<any>;
  readonly toggleEmailAlerts: () => Promise<any>;
  readonly toggleSystemLogs: () => Promise<any>;
  readonly restoreDefaults: () => Promise<any>;

  // Temporary UI Switches State & Mutators (Readonly Protected Data Tree)
  readonly ui: Readonly<TemporaryUISwitches>;
  readonly toggleMobileDrawer: (open?: boolean) => void;
  readonly setActiveTab: (tab: string) => void;
  readonly setSearchQuery: (query: string) => void;

  // Toast System State & Mutators
  readonly toasts: ReadonlyArray<ToastMessage>;
  readonly addToast: (message: string, type: "success" | "warning" | "error") => void;
  readonly removeToast: (id: string) => void;
}

const INITIAL_LOGS: ReadonlyArray<LogEntry> = Object.freeze([
  { id: 1, type: "auth", level: "INFO", text: "[Activity Log]: User saksdev@mekari.co.in authenticated via OAuth2.0", time: "10 mins ago" },
  { id: 2, type: "security", level: "WARN", text: "[Security Alert]: Firewall blocked suspicious IP 192.168.1.45", time: "25 mins ago" },
  { id: 3, type: "database", level: "INFO", text: "[Database]: Central query executed in 1.4ms (Cluster A)", time: "1 hour ago" },
  { id: 4, type: "api", level: "WARN", text: "[API Gateway]: Rate limit threshold reached for endpoint /v1/users", time: "2 hours ago" },
  { id: 5, type: "system", level: "SUCCESS", text: "[System Deploy]: Release v2.4.0 successfully deployed to production", time: "3 hours ago" },
]);

const INITIAL_RECORDS: PermanentWorkspaceRecords = Object.freeze({
  displayName: "Dev",
  contactEmail: "saksdev@mekari.co.in",
  environmentMode: "development",
  maxRateLimit: 1000,
  emailAlertsEnabled: true,
  systemLogsEnabled: false,
  logs: INITIAL_LOGS,
});

const INITIAL_UI: TemporaryUISwitches = Object.freeze({
  isMobileDrawerOpen: false,
  activeTab: "overview",
  searchQuery: "",
});

const WorkspaceContext = createContext<WorkspaceContextType | undefined>(undefined);

/**
 * Provider component to manage global workspace state.
 */
export const WorkspaceProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [records, setRecords] = useState<PermanentWorkspaceRecords>(INITIAL_RECORDS);
  const [ui, setUi] = useState<TemporaryUISwitches>(INITIAL_UI);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [toasts, setToasts] = useState<ReadonlyArray<ToastMessage>>([]);

  // remove toast
  const removeToast = useCallback((id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  const addToast = useCallback((message: string, type: "success" | "warning" | "error") => {
    setToasts((prev) => {
      const isDuplicate = prev.some((t) => t.message === message);
      if (isDuplicate) return prev;

      const id = Math.random().toString(36).substring(2, 9);
      return [{ id, message, type }, ...prev];
    });
  }, []);

  // Fetch initial configuration on mount
  useEffect(() => {
    setIsLoading(true);
    apiClient.get("/api/workspace")
      .then((res) => {
        setRecords(Object.freeze({ ...INITIAL_RECORDS, ...res.data }));
        if (localStorage.getItem("login_success")) {
          addToast("Authenticated successfully. Welcome to Horizon!", "success");
          localStorage.removeItem("login_success");
        }
      })
      .catch((err) => {
        console.error("[WorkspaceStore DevTools]: Failed to load workspace configuration.", err);
        addToast("Failed to fetch initial workspace configurations from server.", "error");
      })
      .finally(() => {
        setIsLoading(false);
      });
  }, [addToast]);

  // Bind global Axios interceptor events to toast alerts
  useEffect(() => {
    registerNetworkErrorListener((message, type) => {
      addToast(message, type);
    });
    return () => {
      registerNetworkErrorListener(null);
    };
  }, [addToast]);

  // Log changes to the central state tree for debugging
  useEffect(() => {
    console.log("[WorkspaceStore DevTools]: Central State Tree Updated.", {
      records,
      ui,
      isLoading,
    });
  }, [records, ui, isLoading]);

  // --- Store modification actions ---
  const updateProfile = useCallback((displayName: string, contactEmail: string) => {
    const cleanName = displayName.trim();
    const cleanEmail = contactEmail.trim();

    if (!cleanName || !cleanEmail) {
      return Promise.reject(new Error("Invalid Profile Parameters"));
    }

    setIsLoading(true);
    return apiClient.put("/api/workspace", { displayName: cleanName, contactEmail: cleanEmail })
      .then((res) => {
        setRecords((prev) => Object.freeze({ ...prev, ...res.data }));
        addToast("Workspace profile settings synchronized successfully.", "success");
        return res.data;
      })
      .catch((err) => {
        console.error("[WorkspaceStore DevTools]: Failed to update profile settings.", err);
        addToast("Failed to save profile changes to central server.", "error");
        throw err;
      })
      .finally(() => {
        setIsLoading(false);
      });
  }, [addToast]);

  const updateEnvironment = useCallback((environmentMode: EnvironmentType) => {
    const validModes: EnvironmentType[] = ["development", "staging", "production"];
    if (!validModes.includes(environmentMode)) {
      return Promise.reject(new Error("Invalid Environment Mode"));
    }

    let targetLimit = 1000;
    let logsEnabled = false;

    if (environmentMode === "production") {
      targetLimit = 5000;
      logsEnabled = true;
    } else if (environmentMode === "staging") {
      targetLimit = 2500;
      logsEnabled = true;
    }

    setIsLoading(true);
    return apiClient.put("/api/workspace", {
      environmentMode,
      maxRateLimit: targetLimit,
      systemLogsEnabled: logsEnabled,
    })
      .then((res) => {
        setRecords((prev) => Object.freeze({ ...prev, ...res.data }));
        addToast(`Runtime switched to ${environmentMode.toUpperCase()} mode. API rate scaling updated.`, "success");
        return res.data;
      })
      .catch((err) => {
        console.error("[WorkspaceStore DevTools]: Failed to update environment configuration.", err);
        addToast("Server failed to register environment change.", "error");
        throw err;
      })
      .finally(() => {
        setIsLoading(false);
      });
  }, [addToast]);

  const updateRateLimit = useCallback((limit: number) => {
    if (isNaN(limit) || limit < 1 || limit > 10000) {
      return Promise.reject(new Error("Invalid Rate Limit Parameter"));
    }

    setIsLoading(true);
    return apiClient.put("/api/workspace", { maxRateLimit: limit })
      .then((res) => {
        setRecords((prev) => Object.freeze({ ...prev, ...res.data }));
        addToast(`API rate limit threshold updated to ${limit.toLocaleString()} req/min.`, "success");
        return res.data;
      })
      .catch((err) => {
        console.error("[WorkspaceStore DevTools]: Failed to update API limit configuration.", err);
        addToast("Server rejected API rate threshold changes.", "error");
        throw err;
      })
      .finally(() => {
        setIsLoading(false);
      });
  }, [addToast]);

  const toggleEmailAlerts = useCallback(() => {
    const previousVal = records.emailAlertsEnabled;
    const nextVal = !previousVal;

    setRecords((prev) => Object.freeze({ ...prev, emailAlertsEnabled: nextVal }));
    addToast(nextVal ? "Email validation alerts activated." : "Email validation alerts disabled.", "success");

    return apiClient.put("/api/workspace", { emailAlertsEnabled: nextVal })
      .then((res) => {
        setRecords((current) => Object.freeze({ ...current, ...res.data }));
        return res.data;
      })
      .catch((err) => {
        console.error("[WorkspaceStore DevTools]: Failed to toggle email alerts.", err);
        setRecords((current) => Object.freeze({ ...current, emailAlertsEnabled: previousVal }));
        addToast("Failed to save email preference on server. Rolled back change.", "error");
        throw err;
      });
  }, [records.emailAlertsEnabled, addToast]);

  const toggleSystemLogs = useCallback(() => {
    const previousVal = records.systemLogsEnabled;
    const nextVal = !previousVal;

    setRecords((prev) => Object.freeze({ ...prev, systemLogsEnabled: nextVal }));
    addToast(nextVal ? "Security logging console activated." : "Security logging console disabled.", "success");

    return apiClient.put("/api/workspace", { systemLogsEnabled: nextVal })
      .then((res) => {
        setRecords((current) => Object.freeze({ ...current, ...res.data }));
        return res.data;
      })
      .catch((err) => {
        console.error("[WorkspaceStore DevTools]: Failed to toggle system logs.", err);
        setRecords((current) => Object.freeze({ ...current, systemLogsEnabled: previousVal }));
        addToast("Failed to save logging preference on server. Rolled back change.", "error");
        throw err;
      });
  }, [records.systemLogsEnabled, addToast]);

  const restoreDefaults = useCallback(() => {
    setIsLoading(true);
    return apiClient.put("/api/workspace", INITIAL_RECORDS)
      .then((res) => {
        setRecords(Object.freeze({ ...INITIAL_RECORDS, ...res.data }));
        setUi(INITIAL_UI);
        addToast("Workspace variables reset back to clean defaults.", "success");
        return res.data;
      })
      .catch((err) => {
        console.error("[WorkspaceStore DevTools]: Failed to restore workspace defaults.", err);
        addToast("Failed to communicate defaults request to mock server.", "error");
        throw err;
      })
      .finally(() => {
        setIsLoading(false);
      });
  }, [addToast]);

  // --- UI state modification actions ---
  const toggleMobileDrawer = useCallback((open?: boolean) => {
    setUi((prev) =>
      Object.freeze({
        ...prev,
        isMobileDrawerOpen: open !== undefined ? open : !prev.isMobileDrawerOpen,
      })
    );
  }, []);

  const setActiveTab = useCallback((activeTab: string) => {
    setUi((prev) =>
      Object.freeze({
        ...prev,
        activeTab,
      })
    );
  }, []);

  const setSearchQuery = useCallback((searchQuery: string) => {
    setUi((prev) =>
      Object.freeze({
        ...prev,
        searchQuery,
      })
    );
  }, []);

  const contextValue = useMemo<WorkspaceContextType>(
    () => ({
      records,
      isLoading,
      updateProfile,
      updateEnvironment,
      updateRateLimit,
      toggleEmailAlerts,
      toggleSystemLogs,
      restoreDefaults,
      ui,
      toggleMobileDrawer,
      setActiveTab,
      setSearchQuery,
      toasts,
      addToast,
      removeToast,
    }),
    [
      records,
      isLoading,
      updateProfile,
      updateEnvironment,
      updateRateLimit,
      toggleEmailAlerts,
      toggleSystemLogs,
      restoreDefaults,
      ui,
      toggleMobileDrawer,
      setActiveTab,
      setSearchQuery,
      toasts,
      addToast,
      removeToast,
    ]
  );

  return <WorkspaceContext.Provider value={contextValue}>{children}</WorkspaceContext.Provider>;
};

export const useWorkspace = (): WorkspaceContextType => {
  const context = useContext(WorkspaceContext);
  if (!context) {
    throw new Error("useWorkspace must be used within a WorkspaceProvider");
  }
  return context;
};

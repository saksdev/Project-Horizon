import React, { createContext, useContext, useState, useCallback, useMemo, useEffect } from "react";
import apiClient from "../api/apiClient";

export type EnvironmentType = "development" | "staging" | "production";

export interface LogEntry {
  readonly id: number;
  readonly type: string;
  readonly level: "INFO" | "WARN" | "SUCCESS";
  readonly text: string;
  readonly time: string;
}

// Slice A: Permanent Workspace Records (FE-09.3 Immutable Data Tree Specification)
export interface PermanentWorkspaceRecords {
  readonly displayName: string;
  readonly contactEmail: string;
  readonly environmentMode: EnvironmentType;
  readonly maxRateLimit: number;
  readonly emailAlertsEnabled: boolean;
  readonly systemLogsEnabled: boolean;
  readonly logs: ReadonlyArray<LogEntry>;
}

// Slice B: Temporary UI Switches (FE-09.3 Immutable Data Tree Specification)
export interface TemporaryUISwitches {
  readonly isMobileDrawerOpen: boolean;
  readonly activeTab: string;
  readonly searchQuery: string;
}

export interface WorkspaceContextType {
  // Permanent Records State & Mutators (Readonly Protected Data Tree)
  readonly records: Readonly<PermanentWorkspaceRecords>;
  readonly isLoading: boolean;
  readonly updateProfile: (displayName: string, contactEmail: string) => void;
  readonly updateEnvironment: (environmentMode: EnvironmentType) => void;
  readonly updateRateLimit: (limit: number) => void;
  readonly toggleEmailAlerts: () => void;
  readonly toggleSystemLogs: () => void;
  readonly restoreDefaults: () => void;

  // Temporary UI Switches State & Mutators (Readonly Protected Data Tree)
  readonly ui: Readonly<TemporaryUISwitches>;
  readonly toggleMobileDrawer: (open?: boolean) => void;
  readonly setActiveTab: (tab: string) => void;
  readonly setSearchQuery: (query: string) => void;
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
 * Workspace Provider Component (FE-09.1, FE-09.3, FE-09.4)
 * Manages central state slices, enforces data tree protection, and synchronizes state with MSW mock backend client.
 */
export const WorkspaceProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  // Permanent State Tree
  const [records, setRecords] = useState<PermanentWorkspaceRecords>(INITIAL_RECORDS);

  // Temporary UI State Tree
  const [ui, setUi] = useState<TemporaryUISwitches>(INITIAL_UI);

  // HTTP Async Loading State
  const [isLoading, setIsLoading] = useState<boolean>(true);

  // Load from mock API on mount (FE-12.4 Setup)
  useEffect(() => {
    setIsLoading(true);
    apiClient.get("/api/workspace")
      .then((res) => {
        setRecords(Object.freeze({ ...INITIAL_RECORDS, ...res.data }));
      })
      .catch((err) => {
        console.error("[WorkspaceStore DevTools]: Failed to load workspace configuration.", err);
      })
      .finally(() => {
        setIsLoading(false);
      });
  }, []);

  // FE-09.4 & FE-10.3: Log the entire global state tree object to console whenever it updates
  useEffect(() => {
    console.log("[WorkspaceStore DevTools]: Central State Tree Updated.", {
      records,
      ui,
      isLoading,
    });
  }, [records, ui, isLoading]);

  // --- FE-09.3: Protected Permanent Records Mutators ---
  const updateProfile = useCallback((displayName: string, contactEmail: string) => {
    const cleanName = displayName.trim();
    const cleanEmail = contactEmail.trim();

    if (!cleanName || !cleanEmail) return;

    setIsLoading(true);
    apiClient.put("/api/workspace", { displayName: cleanName, contactEmail: cleanEmail })
      .then((res) => {
        setRecords((prev) => Object.freeze({ ...prev, ...res.data }));
      })
      .catch((err) => {
        console.error("[WorkspaceStore DevTools]: Failed to update profile settings.", err);
      })
      .finally(() => {
        setIsLoading(false);
      });
  }, []);

  const updateEnvironment = useCallback((environmentMode: EnvironmentType) => {
    const validModes: EnvironmentType[] = ["development", "staging", "production"];
    if (!validModes.includes(environmentMode)) return;

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
    apiClient.put("/api/workspace", {
      environmentMode,
      maxRateLimit: targetLimit,
      systemLogsEnabled: logsEnabled,
    })
      .then((res) => {
        setRecords((prev) => Object.freeze({ ...prev, ...res.data }));
      })
      .catch((err) => {
        console.error("[WorkspaceStore DevTools]: Failed to update environment configuration.", err);
      })
      .finally(() => {
        setIsLoading(false);
      });
  }, []);

  const updateRateLimit = useCallback((limit: number) => {
    if (isNaN(limit) || limit < 1 || limit > 10000) return;

    setIsLoading(true);
    apiClient.put("/api/workspace", { maxRateLimit: limit })
      .then((res) => {
        setRecords((prev) => Object.freeze({ ...prev, ...res.data }));
      })
      .catch((err) => {
        console.error("[WorkspaceStore DevTools]: Failed to update API limit configuration.", err);
      })
      .finally(() => {
        setIsLoading(false);
      });
  }, []);

  const toggleEmailAlerts = useCallback(() => {
    setIsLoading(true);
    setRecords((prev) => {
      const nextVal = !prev.emailAlertsEnabled;
      apiClient.put("/api/workspace", { emailAlertsEnabled: nextVal })
        .then((res) => {
          setRecords((current) => Object.freeze({ ...current, ...res.data }));
        })
        .catch((err) => {
          console.error("[WorkspaceStore DevTools]: Failed to toggle email alerts.", err);
        })
        .finally(() => {
          setIsLoading(false);
        });
      return prev;
    });
  }, []);

  const toggleSystemLogs = useCallback(() => {
    setIsLoading(true);
    setRecords((prev) => {
      const nextVal = !prev.systemLogsEnabled;
      apiClient.put("/api/workspace", { systemLogsEnabled: nextVal })
        .then((res) => {
          setRecords((current) => Object.freeze({ ...current, ...res.data }));
        })
        .catch((err) => {
          console.error("[WorkspaceStore DevTools]: Failed to toggle system logs.", err);
        })
        .finally(() => {
          setIsLoading(false);
        });
      return prev;
    });
  }, []);

  const restoreDefaults = useCallback(() => {
    setIsLoading(true);
    apiClient.put("/api/workspace", INITIAL_RECORDS)
      .then((res) => {
        setRecords(Object.freeze({ ...INITIAL_RECORDS, ...res.data }));
        setUi(INITIAL_UI);
      })
      .catch((err) => {
        console.error("[WorkspaceStore DevTools]: Failed to restore workspace defaults.", err);
      })
      .finally(() => {
        setIsLoading(false);
      });
  }, []);

  // --- FE-09.3: Protected Temporary UI Mutators ---
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
    ]
  );

  return <WorkspaceContext.Provider value={contextValue}>{children}</WorkspaceContext.Provider>;
};

/**
 * Custom Hook to access central workspace state slices and action modifiers.
 */
export const useWorkspace = (): WorkspaceContextType => {
  const context = useContext(WorkspaceContext);
  if (!context) {
    throw new Error("useWorkspace must be used within a WorkspaceProvider");
  }
  return context;
};

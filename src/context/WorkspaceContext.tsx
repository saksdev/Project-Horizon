import React, { createContext, useContext, useState, useCallback, useMemo } from "react";

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
 * Workspace Provider Component (FE-09.1 & FE-09.3)
 * Manages central state slices while enforcing strict data tree protection to eliminate unsafe reference overrides.
 */
export const WorkspaceProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  // Permanent State Tree
  const [records, setRecords] = useState<PermanentWorkspaceRecords>(INITIAL_RECORDS);

  // Temporary UI State Tree
  const [ui, setUi] = useState<TemporaryUISwitches>(INITIAL_UI);

  // --- FE-09.3: Protected Permanent Records Mutators ---
  const updateProfile = useCallback((displayName: string, contactEmail: string) => {
    const cleanName = displayName.trim();
    const cleanEmail = contactEmail.trim();

    if (!cleanName || !cleanEmail) return;

    setRecords((prev) =>
      Object.freeze({
        ...prev,
        displayName: cleanName,
        contactEmail: cleanEmail,
      })
    );
  }, []);

  const updateEnvironment = useCallback((environmentMode: EnvironmentType) => {
    const validModes: EnvironmentType[] = ["development", "staging", "production"];
    if (!validModes.includes(environmentMode)) return;

    setRecords((prev) => {
      let targetLimit = 1000;
      let logsEnabled = false;

      if (environmentMode === "production") {
        targetLimit = 5000;
        logsEnabled = true;
      } else if (environmentMode === "staging") {
        targetLimit = 2500;
        logsEnabled = true;
      }

      return Object.freeze({
        ...prev,
        environmentMode,
        maxRateLimit: targetLimit,
        systemLogsEnabled: logsEnabled,
      });
    });
  }, []);

  const updateRateLimit = useCallback((limit: number) => {
    if (isNaN(limit) || limit < 1 || limit > 10000) return;

    setRecords((prev) =>
      Object.freeze({
        ...prev,
        maxRateLimit: limit,
      })
    );
  }, []);

  const toggleEmailAlerts = useCallback(() => {
    setRecords((prev) =>
      Object.freeze({
        ...prev,
        emailAlertsEnabled: !prev.emailAlertsEnabled,
      })
    );
  }, []);

  const toggleSystemLogs = useCallback(() => {
    setRecords((prev) =>
      Object.freeze({
        ...prev,
        systemLogsEnabled: !prev.systemLogsEnabled,
      })
    );
  }, []);

  const restoreDefaults = useCallback(() => {
    setRecords(INITIAL_RECORDS);
    setUi(INITIAL_UI);
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

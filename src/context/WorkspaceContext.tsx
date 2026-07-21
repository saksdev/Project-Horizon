import React, { createContext, useContext, useState, useCallback, useMemo } from "react";

export type EnvironmentType = "development" | "staging" | "production";

export interface LogEntry {
  id: number;
  type: string;
  level: "INFO" | "WARN" | "SUCCESS";
  text: string;
  time: string;
}

// Slice A: Permanent Workspace Records
export interface PermanentWorkspaceRecords {
  displayName: string;
  contactEmail: string;
  environmentMode: EnvironmentType;
  maxRateLimit: number;
  emailAlertsEnabled: boolean;
  systemLogsEnabled: boolean;
  logs: LogEntry[];
}

// Slice B: Temporary UI Switches
export interface TemporaryUISwitches {
  isMobileDrawerOpen: boolean;
  activeTab: string;
  searchQuery: string;
}

export interface WorkspaceContextType {
  // Permanent Records State & Mutators
  records: PermanentWorkspaceRecords;
  updateProfile: (displayName: string, contactEmail: string) => void;
  updateEnvironment: (environmentMode: EnvironmentType) => void;
  updateRateLimit: (limit: number) => void;
  toggleEmailAlerts: () => void;
  toggleSystemLogs: () => void;
  restoreDefaults: () => void;

  // Temporary UI Switches State & Mutators
  ui: TemporaryUISwitches;
  toggleMobileDrawer: (open?: boolean) => void;
  setActiveTab: (tab: string) => void;
  setSearchQuery: (query: string) => void;
}

const INITIAL_LOGS: LogEntry[] = [
  { id: 1, type: "auth", level: "INFO", text: "[Activity Log]: User saksdev@mekari.co.in authenticated via OAuth2.0", time: "10 mins ago" },
  { id: 2, type: "security", level: "WARN", text: "[Security Alert]: Firewall blocked suspicious IP 192.168.1.45", time: "25 mins ago" },
  { id: 3, type: "database", level: "INFO", text: "[Database]: Central query executed in 1.4ms (Cluster A)", time: "1 hour ago" },
  { id: 4, type: "api", level: "WARN", text: "[API Gateway]: Rate limit threshold reached for endpoint /v1/users", time: "2 hours ago" },
  { id: 5, type: "system", level: "SUCCESS", text: "[System Deploy]: Release v2.4.0 successfully deployed to production", time: "3 hours ago" },
];

const INITIAL_RECORDS: PermanentWorkspaceRecords = {
  displayName: "Dev",
  contactEmail: "saksdev@mekari.co.in",
  environmentMode: "development",
  maxRateLimit: 1000,
  emailAlertsEnabled: true,
  systemLogsEnabled: false,
  logs: INITIAL_LOGS,
};

const INITIAL_UI: TemporaryUISwitches = {
  isMobileDrawerOpen: false,
  activeTab: "overview",
  searchQuery: "",
};

const WorkspaceContext = createContext<WorkspaceContextType | undefined>(undefined);

/**
 * Workspace Provider Component (FE-09.1)
 * Centralizes global state management by decoupling Permanent Workspace Records from Temporary UI Switches.
 */
export const WorkspaceProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  // Permanent State Tree
  const [records, setRecords] = useState<PermanentWorkspaceRecords>(INITIAL_RECORDS);

  // Temporary UI State Tree
  const [ui, setUi] = useState<TemporaryUISwitches>(INITIAL_UI);

  // --- Permanent Records Mutators (FE-09.3 Strict Data Patterns) ---
  const updateProfile = useCallback((displayName: string, contactEmail: string) => {
    setRecords((prev) => ({
      ...prev,
      displayName,
      contactEmail,
    }));
  }, []);

  const updateEnvironment = useCallback((environmentMode: EnvironmentType) => {
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

      return {
        ...prev,
        environmentMode,
        maxRateLimit: targetLimit,
        systemLogsEnabled: logsEnabled,
      };
    });
  }, []);

  const updateRateLimit = useCallback((limit: number) => {
    setRecords((prev) => ({
      ...prev,
      maxRateLimit: limit,
    }));
  }, []);

  const toggleEmailAlerts = useCallback(() => {
    setRecords((prev) => ({
      ...prev,
      emailAlertsEnabled: !prev.emailAlertsEnabled,
    }));
  }, []);

  const toggleSystemLogs = useCallback(() => {
    setRecords((prev) => ({
      ...prev,
      systemLogsEnabled: !prev.systemLogsEnabled,
    }));
  }, []);

  const restoreDefaults = useCallback(() => {
    setRecords(INITIAL_RECORDS);
    setUi(INITIAL_UI);
  }, []);

  // --- Temporary UI Mutators ---
  const toggleMobileDrawer = useCallback((open?: boolean) => {
    setUi((prev) => ({
      ...prev,
      isMobileDrawerOpen: open !== undefined ? open : !prev.isMobileDrawerOpen,
    }));
  }, []);

  const setActiveTab = useCallback((activeTab: string) => {
    setUi((prev) => ({
      ...prev,
      activeTab,
    }));
  }, []);

  const setSearchQuery = useCallback((searchQuery: string) => {
    setUi((prev) => ({
      ...prev,
      searchQuery,
    }));
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

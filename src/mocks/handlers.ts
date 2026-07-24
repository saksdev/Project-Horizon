import { http, HttpResponse, delay } from "msw";

interface WorkspaceConfig {
  displayName: string;
  contactEmail: string;
  environmentMode: string;
  maxRateLimit: number;
  emailAlertsEnabled: boolean;
  systemLogsEnabled: boolean;
}

// In-memory mock database state
let mockDb: WorkspaceConfig = {
  displayName: "Dev",
  contactEmail: "saksdev@mekari.co.in",
  environmentMode: "development",
  maxRateLimit: 1000,
  emailAlertsEnabled: true,
  systemLogsEnabled: false,
};

/**
 * Captures HTTP queries with configured latency timing delays.
 */
export const handlers = [
  http.get("/api/workspace", async () => {
    await delay(1000);
    return HttpResponse.json(mockDb);
  }),

  http.put("/api/workspace", async ({ request }) => {
    const updatedData = (await request.json()) as Partial<WorkspaceConfig>;

    await delay(1000);

    const validationErrors: Record<string, string> = {};

    if (updatedData.displayName !== undefined && updatedData.displayName.trim().length < 3) {
      validationErrors.displayName = "Server requires at least 3 characters for Display Name.";
    }

    if (updatedData.contactEmail !== undefined && updatedData.contactEmail.trim().toLowerCase().includes("@reject.com")) {
      validationErrors.contactEmail = "This administrator email domain is blacklisted by the server (@reject.com).";
    }

    if (Object.keys(validationErrors).length > 0) {
      return HttpResponse.json({ errors: validationErrors }, { status: 400 });
    }

    mockDb = {
      ...mockDb,
      ...updatedData,
    };

    return HttpResponse.json(mockDb);
  }),

  // Diagnostic Endpoint: Trigger mock 401 Unauthorized Error
  http.get("/api/trigger-401", async () => {
    await delay(500);
    return new HttpResponse(null, { status: 401 });
  }),

  // Diagnostic Endpoint: Trigger mock 500 Server Crash Error
  http.get("/api/trigger-500", async () => {
    await delay(500);
    return new HttpResponse(null, { status: 500 });
  }),

  http.get("/api/trigger-offline", async () => {
    await delay(300);
    return HttpResponse.error();
  }),
];

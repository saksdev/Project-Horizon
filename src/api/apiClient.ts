export type NetworkErrorListener = (message: string, type: "error" | "warning") => void;
export type AuthExpiredListener = () => void;

let errorListener: NetworkErrorListener | null = null;
let authExpiredListener: AuthExpiredListener | null = null;

let activeRequestCount = 0;
let totalRequestCount = 0;
let trafficMetricsListeners: Array<() => void> = [];

export const registerNetworkErrorListener = (listener: NetworkErrorListener | null) => {
  errorListener = listener;
};

export const registerAuthExpiredListener = (listener: AuthExpiredListener | null) => {
  authExpiredListener = listener;
};

export const subscribeTrafficMetrics = (listener: () => void) => {
  trafficMetricsListeners.push(listener);
  return () => {
    trafficMetricsListeners = trafficMetricsListeners.filter((l) => l !== listener);
  };
};

export const getTrafficMetrics = () => ({
  activeConnections: activeRequestCount,
  totalRequests: totalRequestCount,
});

const notifyMetricsChange = () => {
  trafficMetricsListeners.forEach((listener) => listener());
};

async function customFetch(url: string, options: RequestInit = {}) {
  activeRequestCount++;
  totalRequestCount++;
  notifyMetricsChange();

  const token = localStorage.getItem("mock_token");
  const headers: Record<string, string> = {
    "Content-Type": "application/json",
    ...(options.headers as Record<string, string>),
  };

  if (token) {
    headers["Authorization"] = `Bearer ${token}`;
  }

  try {
    const response = await fetch(url, { ...options, headers });

    if (response.status === 401 || response.status === 403) {
      console.warn("[Workspace API Interceptor]: Unauthorized access or expired token detected (401/403). Clearing session token and redirecting to login...");
      localStorage.removeItem("mock_token");
      if (authExpiredListener) {
        authExpiredListener();
      } else if (window.location.pathname !== "/login") {
        window.location.href = "/login";
      }
      const err = new Error(`HTTP Error ${response.status}`);
      (err as any).response = { status: response.status };
      throw err;
    }

    if (response.status >= 500) {
      console.error(`[Workspace API Interceptor]: Central server error encountered (${response.status}).`);
      if (errorListener) {
        errorListener(`The central server encountered a crash (${response.status}).`, "error");
      }
      const err = new Error(`HTTP Error ${response.status}`);
      (err as any).response = { status: response.status };
      throw err;
    }

    let data;
    const contentType = response.headers.get("content-type");
    if (contentType && contentType.includes("application/json")) {
      data = await response.json();
    } else {
      data = await response.text();
    }

    return { data, status: response.status, headers: response.headers };
  } catch (error: any) {
    if (error.name === "AbortError") {
      console.log("[Workspace API Interceptor]: In-flight request safely disposed/aborted.");
      throw error;
    }
    if (!error.response) {
      console.error("[Workspace API Interceptor]: Network connection lost or target server unreachable.");
      if (errorListener) {
        errorListener("Network connection lost or target server unreachable.", "warning");
      }
    }
    throw error;
  } finally {
    activeRequestCount = Math.max(0, activeRequestCount - 1);
    notifyMetricsChange();
  }
}

const apiClient = {
  get: (url: string, config?: { signal?: AbortSignal }) =>
    customFetch(url, { method: "GET", ...(config?.signal ? { signal: config.signal } : {}) }),
  put: (url: string, data?: any, config?: { signal?: AbortSignal }) =>
    customFetch(url, { method: "PUT", body: JSON.stringify(data), ...(config?.signal ? { signal: config.signal } : {}) }),
  post: (url: string, data?: any, config?: { signal?: AbortSignal }) =>
    customFetch(url, { method: "POST", body: JSON.stringify(data), ...(config?.signal ? { signal: config.signal } : {}) }),
};

export default apiClient;

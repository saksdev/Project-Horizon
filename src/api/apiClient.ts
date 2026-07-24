import axios from "axios";

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

/** Centralized Axios client instance configured with default parameters */
const apiClient = axios.create({
  baseURL: "",
  timeout: 10000,
  headers: {
    "Content-Type": "application/json",
  },
});

apiClient.interceptors.request.use(
  (config) => {
    activeRequestCount++;
    totalRequestCount++;
    notifyMetricsChange();

    const token = localStorage.getItem("mock_token");
    if (token && config.headers) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

/** handle token expiration (401/403), server crashes (5xx), and offline states. */
apiClient.interceptors.response.use(
  (response) => {
    activeRequestCount = Math.max(0, activeRequestCount - 1);
    notifyMetricsChange();
    return response;
  },
  (error) => {
    activeRequestCount = Math.max(0, activeRequestCount - 1);
    notifyMetricsChange();

    if (axios.isCancel(error)) {
      console.log("[Workspace API Interceptor]: In-flight request safely disposed/aborted.");
      return Promise.reject(error);
    }

    if (error.response) {
      const { status } = error.response;

      if (status === 401 || status === 403) {
        console.warn("[Workspace API Interceptor]: Unauthorized access or expired token detected (401/403). Clearing session token and redirecting to login...");
        localStorage.removeItem("mock_token");
        if (authExpiredListener) {
          authExpiredListener();
        } else if (window.location.pathname !== "/login") {
          window.location.href = "/login";
        }
      } else if (status >= 500) {
        console.error(`[Workspace API Interceptor]: Central server error encountered (${status}).`);
        if (errorListener) {
          errorListener(`The central server encountered a crash (${status}).`, "error");
        }
      }
    } else {
      console.error("[Workspace API Interceptor]: Network connection lost or target server unreachable.");
      if (errorListener) {
        errorListener("Network connection lost or target server unreachable.", "warning");
      }
    }
    return Promise.reject(error);
  }
);

export default apiClient;


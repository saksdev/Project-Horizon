import axios from "axios";

/**
 * Centralized Axios client instance configured with default parameters (FE-11.1).
 */
const apiClient = axios.create({
  baseURL: "", // Empty baseURL to support relative API paths intercepted by MSW
  timeout: 10000, // Enforce a 10,000ms request timeout limit
  headers: {
    "Content-Type": "application/json",
  },
});

/**
 * Axios Request Interceptor (FE-11.1 & FE-13.1).
 * Automatically injects a bearer authorization token dynamically from localStorage.
 */
apiClient.interceptors.request.use(
  (config) => {
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

/**
 * Axios Response Interceptor (FE-11.3 & FE-13.1).
 * Intercepts incoming responses globally to handle token expiration (401/403), server errors (5xx), and connectivity failures.
 */
apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response) {
      const { status } = error.response;

      if (status === 401 || status === 403) {
        console.warn("[Workspace API Interceptor]: Unauthorized access or expired token detected (401/403). Clearing session token and redirecting to login...");
        localStorage.removeItem("mock_token");
        if (window.location.pathname !== "/login") {
          window.location.href = "/login";
        }
      } else if (status >= 500) {
        console.error(`[Workspace API Interceptor]: Central server error encountered (${status}).`);
      }
    } else {
      console.error("[Workspace API Interceptor]: Network connection lost or target server unreachable.");
    }
    return Promise.reject(error);
  }
);

export default apiClient;

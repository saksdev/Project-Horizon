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
 * Axios Request Interceptor (FE-11.1).
 * Automatically injects a bearer authorization token into all outgoing requests.
 */
apiClient.interceptors.request.use(
  (config) => {
    const token = "mock_auth_token_horizon_2026";
    if (config.headers) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

export default apiClient;

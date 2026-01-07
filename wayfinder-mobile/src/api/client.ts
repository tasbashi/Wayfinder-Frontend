import axios, { InternalAxiosRequestConfig } from "axios";
import { API_CONFIG } from "../config/api.config";
import { TokenStorage } from "../utils/tokenStorage";
import i18n from "../i18n";

export const apiClient = axios.create({
  baseURL: API_CONFIG.baseURL,
  headers: {
    "Content-Type": "application/json",
  },
  timeout: API_CONFIG.timeout,
});

// Request interceptor - Add access token, Accept-Language header, and log requests
apiClient.interceptors.request.use(
  async (config: InternalAxiosRequestConfig) => {
    // Add Accept-Language header for localized API responses
    config.headers["Accept-Language"] = i18n.language || "en";

    // Log API request
    const method = config.method?.toUpperCase() || "?";
    const url = config.url || "";
    const params = config.params
      ? `?${new URLSearchParams(config.params).toString()}`
      : "";
    console.log(`🚀 [API] ${method} ${API_CONFIG.baseURL}${url}${params}`);

    const token = await TokenStorage.getAccessToken();
    if (token && config.headers) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Response interceptor - Log responses
apiClient.interceptors.response.use(
  (response) => {
    console.log(`✅ [API] ${response.status} ${response.config.url}`);
    return response;
  },
  (error) => {
    if (error.response) {
      console.error(
        `❌ [API] ${error.response.status} ${error.config?.url}:`,
        error.response.data
      );
    } else {
      console.error(`❌ [API] Network error:`, error.message);
    }
    return Promise.reject(error);
  }
);

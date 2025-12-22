import axios, { AxiosError, InternalAxiosRequestConfig } from "axios";
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

// Response interceptor - Handle token refresh
let isRefreshing = false;
let failedQueue: Array<{
  resolve: (value?: unknown) => void;
  reject: (reason?: unknown) => void;
}> = [];

const processQueue = (error: Error | null, token: string | null = null) => {
  failedQueue.forEach((prom) => {
    if (error) {
      prom.reject(error);
    } else {
      prom.resolve(token);
    }
  });
  failedQueue = [];
};

apiClient.interceptors.response.use(
  (response) => response,
  async (error: AxiosError) => {
    const originalRequest = error.config as InternalAxiosRequestConfig & {
      _retry?: boolean;
    };

    if (error.response?.status === 401 && !originalRequest._retry) {
      if (isRefreshing) {
        return new Promise((resolve, reject) => {
          failedQueue.push({ resolve, reject });
        })
          .then((token) => {
            if (originalRequest.headers) {
              originalRequest.headers.Authorization = `Bearer ${token}`;
            }
            return apiClient(originalRequest);
          })
          .catch((err) => Promise.reject(err));
      }

      originalRequest._retry = true;
      isRefreshing = true;

      try {
        const refreshToken = await TokenStorage.getRefreshToken();
        if (!refreshToken) {
          throw new Error("No refresh token available");
        }

        // Lazy import AuthService to avoid circular dependency
        const { AuthService } = await import("./auth.service");
        const { accessToken } = await AuthService.refreshToken(refreshToken);
        processQueue(null, accessToken);

        if (originalRequest.headers) {
          originalRequest.headers.Authorization = `Bearer ${accessToken}`;
        }

        return apiClient(originalRequest);
      } catch (refreshError) {
        processQueue(refreshError as Error, null);
        // Lazy import AuthService to avoid circular dependency
        const { AuthService } = await import("./auth.service");
        await AuthService.logout();
        return Promise.reject(refreshError);
      } finally {
        isRefreshing = false;
      }
    }

    return Promise.reject(error);
  }
);


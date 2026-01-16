import axios, { AxiosError, AxiosInstance, AxiosRequestConfig } from "axios";
import { API_CONFIG } from "@/config/api.config";
import type { ApiError } from "@/types/api.types";

/**
 * Create Axios Instance with interceptors
 */
const createApiClient = (): AxiosInstance => {
    const client = axios.create({
        baseURL: API_CONFIG.baseUrl,
        timeout: API_CONFIG.timeout,
        headers: {
            "Content-Type": "application/json",
            Accept: "application/json",
        },
    });

    // Request Interceptor
    client.interceptors.request.use(
        (config) => {
            // Log request in development
            if (__DEV__) {
                console.log(`[API] ${config.method?.toUpperCase()} ${config.url}`);
            }
            return config;
        },
        (error) => {
            return Promise.reject(error);
        }
    );

    // Response Interceptor
    client.interceptors.response.use(
        (response) => {
            return response;
        },
        (error: AxiosError<ApiError>) => {
            // Handle common errors
            if (error.response) {
                const { status, data } = error.response;

                // Log error in development
                if (__DEV__) {
                    console.error(`[API Error] ${status}:`, data?.message || error.message);
                }

                // Create standardized error
                const apiError: ApiError = {
                    message: data?.message || getDefaultErrorMessage(status),
                    code: data?.code,
                    errors: data?.errors,
                    statusCode: status,
                };

                return Promise.reject(apiError);
            }

            // Network error
            if (error.request) {
                const networkError: ApiError = {
                    message: "Bağlantı hatası. İnternet bağlantınızı kontrol edin.",
                    code: "NETWORK_ERROR",
                    statusCode: 0,
                };
                return Promise.reject(networkError);
            }

            return Promise.reject(error);
        }
    );

    return client;
};

/**
 * Get default error message based on status code
 */
const getDefaultErrorMessage = (status: number): string => {
    switch (status) {
        case 400:
            return "Geçersiz istek.";
        case 401:
            return "Yetkisiz erişim.";
        case 403:
            return "Bu işlem için yetkiniz yok.";
        case 404:
            return "Kaynak bulunamadı.";
        case 500:
            return "Sunucu hatası. Lütfen daha sonra tekrar deneyin.";
        default:
            return "Bir hata oluştu.";
    }
};

/**
 * Exported API Client Instance
 */
export const apiClient = createApiClient();

/**
 * Generic GET request
 */
export const get = async <T>(url: string, config?: AxiosRequestConfig): Promise<T> => {
    const response = await apiClient.get<T>(url, config);
    return response.data;
};

/**
 * Generic POST request
 */
export const post = async <T, D = unknown>(
    url: string,
    data?: D,
    config?: AxiosRequestConfig
): Promise<T> => {
    const response = await apiClient.post<T>(url, data, config);
    return response.data;
};

/**
 * Generic PUT request
 */
export const put = async <T, D = unknown>(
    url: string,
    data?: D,
    config?: AxiosRequestConfig
): Promise<T> => {
    const response = await apiClient.put<T>(url, data, config);
    return response.data;
};

/**
 * Generic DELETE request
 */
export const del = async <T>(url: string, config?: AxiosRequestConfig): Promise<T> => {
    const response = await apiClient.delete<T>(url, config);
    return response.data;
};

import axios, { AxiosRequestConfig, AxiosResponse, AxiosError } from "axios";
import { ApiResponse } from "@/types";

// Create Axios instance with default config
const api = axios.create({
  baseURL: "/api",
  headers: {
    "Content-Type": "application/json",
  },
  timeout: 30000, // 30 seconds
});

// Request interceptor for adding auth token
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("authToken");
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor for handling common errors
api.interceptors.response.use(
  (response) => response,
  (error: AxiosError) => {
    // Handle unauthorized errors (401) - token expired
    if (error.response?.status === 401) {
      // Clear local storage and redirect to login
      localStorage.removeItem("authToken");
      if (window.location.pathname !== "/login") {
        window.location.href = "/login";
      }
    }

    // Handle session timeout (403) - session expired
    if (error.response?.status === 403) {
      // Redirect to login with return URL
      if (window.location.pathname !== "/login") {
        window.location.href = `/login?returnUrl=${encodeURIComponent(window.location.pathname)}`;
      }
    }

    // Handle server errors (500)
    if (error.response?.status === 500) {
      console.error("Server error:", error.response?.data);
    }

    return Promise.reject(error);
  }
);

// Generic request method with type safety
export const request = async <T = any>(
  config: AxiosRequestConfig
): Promise<ApiResponse<T>> => {
  try {
    const response: AxiosResponse<ApiResponse<T>> = await api(config);
    return response.data;
  } catch (error) {
    if (axios.isAxiosError(error) && error.response) {
      return error.response.data as ApiResponse<T>;
    }
    // Create a generic error response
    return {
      success: false,
      error: "An unexpected error occurred",
      data: null as unknown as T,
    };
  }
};

// Convenience methods for common HTTP methods
export const get = <T = any>(
  url: string,
  params?: any
): Promise<ApiResponse<T>> => request<T>({ method: "GET", url, params });

export const post = <T = any>(
  url: string,
  data?: any
): Promise<ApiResponse<T>> => request<T>({ method: "POST", url, data });

export const put = <T = any>(
  url: string,
  data?: any
): Promise<ApiResponse<T>> => request<T>({ method: "PUT", url, data });

export const del = <T = any>(url: string): Promise<ApiResponse<T>> =>
  request<T>({ method: "DELETE", url });

export default api;

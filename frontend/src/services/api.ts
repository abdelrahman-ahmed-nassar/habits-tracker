import axios, { AxiosRequestConfig, AxiosResponse, AxiosError } from "axios";
import { ApiResponse } from "@/types";

// Create Axios instance with default config
const api = axios.create({
  baseURL: "/api",
  headers: {
    "Content-Type": "application/json",
  },
  timeout: 10000, // 10 seconds
});

// Request interceptor
api.interceptors.request.use(
  (config) => {
    // You can add auth tokens here if needed
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor
api.interceptors.response.use(
  (response) => {
    return response;
  },
  (error: AxiosError) => {
    // Handle common errors
    if (error.response) {
      if (error.response.status === 401) {
        // Handle unauthorized
        console.error("Unauthorized access");
      } else if (error.response.status === 404) {
        // Handle not found
        console.error("Resource not found");
      } else if (error.response.status >= 500) {
        // Handle server errors
        console.error("Server error occurred");
      }
    } else if (error.request) {
      // Handle network errors
      console.error("Network error - no response received");
    } else {
      // Handle other errors
      console.error("Error", error.message);
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

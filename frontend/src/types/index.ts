// Re-export shared types for frontend use
export * from "../../../shared/types";

// Frontend-specific types
export interface ApiResponse<T> {
  success: boolean;
  data: T;
  message?: string;
}

export interface LoadingState {
  isLoading: boolean;
  error: string | null;
}

// API service configuration
export interface ApiConfig {
  baseURL?: string;
  timeout?: number;
  retryAttempts?: number;
  retryDelay?: number;
}

// Request configuration
export interface RequestConfig {
  params?: Record<string, any>;
  headers?: Record<string, string>;
  retry?: boolean;
}

// Error types
export interface ApiError extends Error {
  status?: number;
  code?: string;
  response?: any;
}

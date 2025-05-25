import axios, { AxiosError, AxiosInstance } from "axios";
import type { ApiResponse } from "@shared/types/api";

const API_BASE_URL = "http://localhost:5000/api";

class ApiError extends Error {
  constructor(
    message: string,
    public status?: number,
    public errors?: Array<{ field: string; message: string }>
  ) {
    super(message);
    this.name = "ApiError";
  }
}

export class ApiService {
  private api: AxiosInstance;

  constructor() {
    this.api = axios.create({
      baseURL: API_BASE_URL,
      headers: {
        "Content-Type": "application/json",
      },
    });

    this.setupInterceptors();
  }

  private setupInterceptors() {
    this.api.interceptors.response.use(
      (response) => response,
      (
        error: AxiosError<
          ApiResponse<unknown> & {
            errors?: Array<{ field: string; message: string }>;
          }
        >
      ) => {
        if (error.response) {
          const { data, status } = error.response;
          throw new ApiError(
            data.message || "An error occurred",
            status,
            data.errors
          );
        }
        throw new ApiError("Network error");
      }
    );
  }

  protected async get<T>(url: string, params?: Record<string, unknown>) {
    const response = await this.api.get<ApiResponse<T>>(url, { params });
    return response.data;
  }

  protected async post<T>(url: string, data?: unknown) {
    const response = await this.api.post<ApiResponse<T>>(url, data);
    return response.data;
  }

  protected async put<T>(url: string, data?: unknown) {
    const response = await this.api.put<ApiResponse<T>>(url, data);
    return response.data;
  }

  protected async delete<T>(url: string) {
    const response = await this.api.delete<ApiResponse<T>>(url);
    return response.data;
  }
}

export const apiService = new ApiService();

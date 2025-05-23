import { Request, Response } from "express";
import { Habit, UserSettings } from "@ultimate-habits-tracker/shared";

// Custom request interfaces
export interface TypedRequest<T = unknown, Q = unknown> extends Request {
  body: T;
  query: Q;
}

export interface HabitRequest extends Request {
  habit?: Habit;
}

// Common query parameters
export interface PaginationQuery {
  page?: number;
  limit?: number;
}

export interface DateRangeQuery {
  startDate?: string;
  endDate?: string;
}

// Response interfaces
export interface ApiResponse<T> {
  success: boolean;
  message?: string;
  data?: T;
  error?: string;
  timestamp: string;
}

export type TypedResponse<T = unknown> = Response<ApiResponse<T>>;

// Error response type
export interface ErrorResponse {
  error: string;
  message: string;
  stack?: string;
  statusCode: number;
}

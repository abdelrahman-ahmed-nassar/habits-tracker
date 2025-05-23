import { Request, Response } from "express";
import { ParsedQs } from "qs";

// Define local type stubs for shared types (for testing purposes)
interface SharedHabit {
  id: string;
  [key: string]: any;
}

interface SharedUserSettings {
  [key: string]: any;
}

// Custom request interfaces
export interface TypedRequest<T = any, Q extends ParsedQs = ParsedQs>
  extends Request {
  body: T;
  query: Q;
}

export interface HabitRequest extends Request {
  habit?: SharedHabit;
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

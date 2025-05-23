import axios, { AxiosRequestConfig, AxiosResponse, AxiosError } from "axios";
import { ApiResponse, Habit, HabitCompletion } from "@/types";

// Create Axios instance with default config
const api = axios.create({
  baseURL: "/api",
  headers: {
    "Content-Type": "application/json",
  },
  timeout: 30000, // 30 seconds
});

// Mock data for development when API is unavailable
const mockHabits: Habit[] = [
  {
    id: "1",
    name: "Morning Meditation",
    description: "15 minutes of mindful meditation",
    category: "Wellness",
    frequency: [1, 2, 3, 4, 5, 6, 7],
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    color: "bg-blue-500",
    icon: "meditation",
  },
  {
    id: "2",
    name: "Read a Book",
    description: "Read for at least 30 minutes",
    category: "Learning",
    frequency: [1, 3, 5, 7],
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    color: "bg-green-500",
    icon: "book",
  },
  {
    id: "3",
    name: "Exercise",
    description: "30 minutes workout",
    category: "Fitness",
    frequency: [2, 4, 6],
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    color: "bg-red-500",
    icon: "dumbbell",
  },
];

const mockCompletions: HabitCompletion[] = [
  {
    id: "1",
    habitId: "1",
    date: new Date().toISOString().split("T")[0],
    completed: true,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
];

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
      message: "An unexpected error occurred",
      data: null as unknown as T,
    };
  }
};

// Check if we should use mock data (development mode or specific errors)
const shouldUseMockData = () => {
  return import.meta.env.DEV || import.meta.env.VITE_USE_MOCKS === "true";
};

// Helper function to get mock data based on URL
const getMockData = <T>(url: string): T | null => {
  // Handle habits endpoint
  if (url === "/habits") {
    return { data: mockHabits, success: true } as unknown as T;
  }

  // Handle completions by date endpoint
  if (url.startsWith("/completions/date/")) {
    return { data: mockCompletions, success: true } as unknown as T;
  }

  // Add other endpoints as needed
  return null;
};

// Convenience methods for common HTTP methods
export const get = async <T>(url: string, params?: any): Promise<T> => {
  try {
    const response = await api.get<T>(url, { params });
    return response.data;
  } catch (error) {
    console.error(`Error fetching data from ${url}:`, error);

    // Use mock data for development or if error is 404/500
    if (
      shouldUseMockData() ||
      (axios.isAxiosError(error) &&
        (error.response?.status === 404 || error.response?.status === 500))
    ) {
      const mockData = getMockData<T>(url);
      if (mockData) {
        console.info(`Using mock data for ${url}`);
        return mockData;
      }
    }

    throw error;
  }
};

export const post = async <T>(url: string, data?: any): Promise<T> => {
  try {
    const response = await api.post<T>(url, data);
    return response.data;
  } catch (error) {
    console.error(`Error posting data to ${url}:`, error);

    // Handle specific post operations with mock data for development
    if (
      shouldUseMockData() ||
      (axios.isAxiosError(error) &&
        (error.response?.status === 404 || error.response?.status === 500))
    ) {
      // Handle completions toggle endpoint
      if (url.startsWith("/completions/toggle")) {
        const matchingCompletion = mockCompletions.find(
          (c) => c.habitId === data.habitId && c.date === data.date
        );

        if (matchingCompletion) {
          matchingCompletion.completed = !matchingCompletion.completed;
          return { data: matchingCompletion, success: true } as unknown as T;
        } else {
          const newCompletion: HabitCompletion = {
            id: `temp-${Date.now()}`,
            habitId: data.habitId,
            date: data.date,
            completed: true,
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
          };
          mockCompletions.push(newCompletion);
          return { data: newCompletion, success: true } as unknown as T;
        }
      }

      // Add other POST endpoints as needed
    }

    throw error;
  }
};

export const put = async <T>(url: string, data?: any): Promise<T> => {
  try {
    const response = await api.put<T>(url, data);
    return response.data;
  } catch (error) {
    console.error(`Error putting data to ${url}:`, error);

    // Add mock data handling for PUT requests if needed

    throw error;
  }
};

export const del = async <T>(url: string): Promise<T> => {
  try {
    const response = await api.delete<T>(url);
    return response.data;
  } catch (error) {
    console.error(`Error deleting data from ${url}:`, error);

    // Add mock data handling for DELETE requests if needed

    throw error;
  }
};

export default api;

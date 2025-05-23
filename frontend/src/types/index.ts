// Re-export shared types from the backend
export * from "../../../shared/types";

// Frontend-specific types
export interface ThemeMode {
  mode: "light" | "dark" | "system";
}

export interface User {
  id: string;
  name?: string;
  email?: string;
  preferences?: {
    theme: ThemeMode["mode"];
    notifications: boolean;
  };
}

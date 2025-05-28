import axios from "axios";

const API_BASE_URL = "http://localhost:5002/api";

// Types
interface ApiResponse<T> {
  success: boolean;
  data: T;
  message?: string;
}

// Moods API
export const getMoods = async (): Promise<string[]> => {
  const response = await axios.get<ApiResponse<string[]>>(
    `${API_BASE_URL}/options/moods`
  );
  return response.data.data;
};

export const addMood = async (mood: string): Promise<void> => {
  await axios.post<ApiResponse<void>>(`${API_BASE_URL}/options/moods`, {
    mood,
  });
};

export const removeMood = async (mood: string): Promise<void> => {
  await axios.delete<ApiResponse<void>>(
    `${API_BASE_URL}/options/moods/${mood}`
  );
};

// Productivity Levels API
export const getProductivityLevels = async (): Promise<string[]> => {
  const response = await axios.get<ApiResponse<string[]>>(
    `${API_BASE_URL}/options/productivity-levels`
  );
  return response.data.data;
};

export const addProductivityLevel = async (level: string): Promise<void> => {
  await axios.post<ApiResponse<void>>(
    `${API_BASE_URL}/options/productivity-levels`,
    { level }
  );
};

export const removeProductivityLevel = async (level: string): Promise<void> => {
  await axios.delete<ApiResponse<void>>(
    `${API_BASE_URL}/options/productivity-levels/${level}`
  );
};

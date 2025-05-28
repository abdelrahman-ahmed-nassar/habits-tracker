import axios from "axios";

const API_BASE_URL = "http://localhost:5002/api";

// Types
interface ApiResponse<T> {
  success: boolean;
  data: T;
  message?: string;
}

export interface MoodOption {
  label: string;
  value: number;
}

export interface ProductivityOption {
  label: string;
  value: number;
}

// Moods API
export const getMoods = async (): Promise<MoodOption[]> => {
  const response = await axios.get<ApiResponse<MoodOption[]>>(
    `${API_BASE_URL}/options/moods`
  );
  return response.data.data;
};

export const getMoodLabels = async (): Promise<string[]> => {
  const response = await axios.get<ApiResponse<string[]>>(
    `${API_BASE_URL}/options/moods?legacy=true`
  );
  return response.data.data;
};

export const addMood = async (mood: string | MoodOption): Promise<void> => {
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
export const getProductivityLevels = async (): Promise<
  ProductivityOption[]
> => {
  const response = await axios.get<ApiResponse<ProductivityOption[]>>(
    `${API_BASE_URL}/options/productivity-levels`
  );
  return response.data.data;
};

export const getProductivityLabels = async (): Promise<string[]> => {
  const response = await axios.get<ApiResponse<string[]>>(
    `${API_BASE_URL}/options/productivity-levels?legacy=true`
  );
  return response.data.data;
};

export const addProductivityLevel = async (
  level: string | ProductivityOption
): Promise<void> => {
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

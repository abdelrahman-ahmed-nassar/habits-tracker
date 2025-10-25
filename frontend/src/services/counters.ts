import axios from "axios";
import {
  Counter,
  CreateCounterRequest,
  UpdateCounterRequest,
} from "@shared/types";

const API_BASE_URL = "http://localhost:5002/api";

class CountersService {
  /**
   * Get all counters
   */
  async getAllCounters(): Promise<Counter[]> {
    const response = await axios.get(`${API_BASE_URL}/counters`);
    return response.data.data;
  }

  /**
   * Get a single counter by ID
   * @param id - The ID of the counter
   */
  async getCounter(id: string): Promise<Counter> {
    const response = await axios.get(`${API_BASE_URL}/counters/${id}`);
    return response.data.data;
  }

  /**
   * Create a new counter
   * @param counter - The counter data
   */
  async createCounter(counter: CreateCounterRequest): Promise<Counter> {
    const response = await axios.post(`${API_BASE_URL}/counters`, counter);
    return response.data.data;
  }

  /**
   * Update an existing counter
   * @param id - The ID of the counter
   * @param counter - The updated counter data
   */
  async updateCounter(
    id: string,
    counter: UpdateCounterRequest
  ): Promise<Counter> {
    const response = await axios.put(`${API_BASE_URL}/counters/${id}`, counter);
    return response.data.data;
  }

  /**
   * Patch counter count
   * @param id - The ID of the counter
   * @param currentCount - The new count value
   */
  async patchCounterCount(id: string, currentCount: number): Promise<Counter> {
    const response = await axios.patch(`${API_BASE_URL}/counters/${id}/count`, {
      currentCount,
    });
    return response.data.data;
  }

  /**
   * Increment counter count
   * @param id - The ID of the counter
   * @param currentCount - The current count value
   */
  async incrementCounter(id: string, currentCount: number): Promise<Counter> {
    return this.patchCounterCount(id, currentCount + 1);
  }

  /**
   * Decrement counter count
   * @param id - The ID of the counter
   * @param currentCount - The current count value
   */
  async decrementCounter(id: string, currentCount: number): Promise<Counter> {
    return this.patchCounterCount(id, Math.max(0, currentCount - 1));
  }

  /**
   * Delete a counter
   * @param id - The ID of the counter
   */
  async deleteCounter(id: string): Promise<void> {
    await axios.delete(`${API_BASE_URL}/counters/${id}`);
  }
}

export const countersService = new CountersService();

import { NoteTemplate } from '@shared/types/template';

const API_BASE_URL = 'http://localhost:5000/api';

interface ApiResponse<T> {
  success: boolean;
  data: T;
  message?: string;
}

export class TemplatesService {
  /**
   * Get all templates
   */
  static async getAllTemplates(): Promise<NoteTemplate[]> {
    const response = await fetch(`${API_BASE_URL}/templates`);
    const result: ApiResponse<NoteTemplate[]> = await response.json();
    
    if (!result.success) {
      throw new Error(result.message || 'Failed to fetch templates');
    }
    
    return result.data;
  }

  /**
   * Get template by ID
   */
  static async getTemplateById(id: string): Promise<NoteTemplate> {
    const response = await fetch(`${API_BASE_URL}/templates/${id}`);
    const result: ApiResponse<NoteTemplate> = await response.json();
    
    if (!result.success) {
      throw new Error(result.message || 'Failed to fetch template');
    }
    
    return result.data;
  }

  /**
   * Create a new template
   */
  static async createTemplate(template: Omit<NoteTemplate, 'id' | 'createdAt' | 'updatedAt'>): Promise<NoteTemplate> {
    const response = await fetch(`${API_BASE_URL}/templates`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(template),
    });
    
    const result: ApiResponse<NoteTemplate> = await response.json();
    
    if (!result.success) {
      throw new Error(result.message || 'Failed to create template');
    }
    
    return result.data;
  }

  /**
   * Update a template
   */
  static async updateTemplate(
    id: string, 
    template: Partial<Omit<NoteTemplate, 'id' | 'createdAt' | 'updatedAt'>>
  ): Promise<NoteTemplate> {
    const response = await fetch(`${API_BASE_URL}/templates/${id}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(template),
    });
    
    const result: ApiResponse<NoteTemplate> = await response.json();
    
    if (!result.success) {
      throw new Error(result.message || 'Failed to update template');
    }
    
    return result.data;
  }

  /**
   * Delete a template
   */
  static async deleteTemplate(id: string): Promise<void> {
    const response = await fetch(`${API_BASE_URL}/templates/${id}`, {
      method: 'DELETE',
    });
    
    const result: ApiResponse<void> = await response.json();
    
    if (!result.success) {
      throw new Error(result.message || 'Failed to delete template');
    }
  }

  /**
   * Apply a template to create a note
   * Formats the template with the given variables
   */
  static formatTemplate(template: string, variables: Record<string, string>): string {
    return template.replace(/\{\{(\w+)\}\}/g, (match, key) => {
      return variables[key] || match;
    });
  }
}

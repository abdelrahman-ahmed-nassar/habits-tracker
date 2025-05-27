import { Request, Response } from 'express';
import path from 'path';
import fs from 'fs/promises';
import { v4 as uuidv4 } from 'uuid';
import { NoteTemplate } from '@shared/types';
import { dataService } from '../services/dataService';

const TEMPLATES_FILE = path.join(__dirname, '../../data/notes_templates.json');

/**
 * Get all note templates
 */
export const getAllTemplates = async (req: Request, res: Response) => {
  try {
    const templates = await dataService.getAll<NoteTemplate>('notes_templates');
    return res.status(200).json(templates);
  } catch (error) {
    console.error('Error fetching templates:', error);
    return res.status(500).json({ error: 'Failed to fetch templates' });
  }
};

/**
 * Get template by ID
 */
export const getTemplateById = async (req: Request, res: Response) => {
  const { id } = req.params;
  
  try {
    const template = await dataService.getById<NoteTemplate>('notes_templates', id);
    
    if (!template) {
      return res.status(404).json({ error: 'Template not found' });
    }
    
    return res.status(200).json(template);
  } catch (error) {
    console.error('Error fetching template:', error);
    return res.status(500).json({ error: 'Failed to fetch template' });
  }
};

/**
 * Create new template
 */
export const createTemplate = async (req: Request, res: Response) => {
  try {
    const { name, template } = req.body;
    
    if (!name || !template) {
      return res.status(400).json({ error: 'Name and template content are required' });
    }
    
    const newTemplate: NoteTemplate = {
      id: uuidv4(),
      name,
      template,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
    
    await dataService.add('notes_templates', newTemplate);
    
    return res.status(201).json(newTemplate);
  } catch (error) {
    console.error('Error creating template:', error);
    return res.status(500).json({ error: 'Failed to create template' });
  }
};

/**
 * Update template
 */
export const updateTemplate = async (req: Request, res: Response) => {
  const { id } = req.params;
  const { name, template } = req.body;
  
  try {
    const existingTemplate = await dataService.getById<NoteTemplate>('notes_templates', id);
    
    if (!existingTemplate) {
      return res.status(404).json({ error: 'Template not found' });
    }
    
    const updatedTemplate: NoteTemplate = {
      ...existingTemplate,
      name: name || existingTemplate.name,
      template: template || existingTemplate.template,
      updatedAt: new Date().toISOString()
    };
    
    await dataService.update('notes_templates', id, updatedTemplate);
    
    return res.status(200).json(updatedTemplate);
  } catch (error) {
    console.error('Error updating template:', error);
    return res.status(500).json({ error: 'Failed to update template' });
  }
};

/**
 * Delete template
 */
export const deleteTemplate = async (req: Request, res: Response) => {
  const { id } = req.params;
  
  try {
    const existingTemplate = await dataService.getById<NoteTemplate>('notes_templates', id);
    
    if (!existingTemplate) {
      return res.status(404).json({ error: 'Template not found' });
    }
    
    await dataService.remove('notes_templates', id);
    
    return res.status(200).json({ message: 'Template deleted successfully' });
  } catch (error) {
    console.error('Error deleting template:', error);
    return res.status(500).json({ error: 'Failed to delete template' });
  }
};

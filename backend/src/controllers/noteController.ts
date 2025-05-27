import { Request, Response } from "express";
import { v4 as uuidv4 } from "uuid";
import { DailyNote } from "@shared/types";
import * as dataService from "../services/dataService";
import { AppError, asyncHandler } from "../middleware/errorHandler";
import { isValidDateFormat, validateDailyNote } from "../utils/validation";

/**
 * Get all notes
 * @route GET /api/notes
 */
export const getAllNotes = asyncHandler(async (req: Request, res: Response) => {
  const notes = await dataService.getNotes();
  res.status(200).json({
    success: true,
    data: notes,
  });
});

/**
 * Get note by date
 * @route GET /api/notes/:date
 */
export const getNoteByDate = asyncHandler(
  async (req: Request, res: Response) => {
    const { date } = req.params;

    // Validate date format
    if (!isValidDateFormat(date)) {
      throw new AppError("Invalid date format. Use YYYY-MM-DD", 400);
    }

    const note = await dataService.getNoteByDate(date);
    if (!note) {
      throw new AppError(`No note found for date ${date}`, 404);
    }

    res.status(200).json({
      success: true,
      data: note,
    });
  }
);

/**
 * Create a new note
 * @route POST /api/notes
 */
export const createNote = asyncHandler(async (req: Request, res: Response) => {
  const { date, content, mood, productivityLevel } = req.body;

  // Validate date format
  if (!isValidDateFormat(date)) {
    throw new AppError("Invalid date format. Use YYYY-MM-DD", 400);
  }

  const noteData: Omit<DailyNote, "id" | "createdAt" | "updatedAt"> = {
    date,
    content,
    mood,
    productivityLevel,
  };

  // Validate note data
  const validationErrors = await validateDailyNote(noteData);
  if (validationErrors.length > 0) {
    throw new AppError(validationErrors[0].message, 400);
  }

  const note = await dataService.saveNote(noteData);
  res.status(201).json({
    success: true,
    data: note,
  });
});

/**
 * Update a note
 * @route PUT /api/notes/:id
 */
export const updateNote = asyncHandler(async (req: Request, res: Response) => {
  const { id } = req.params;
  const { content, mood, productivityLevel } = req.body;

  const noteData: Partial<Omit<DailyNote, "id" | "createdAt" | "updatedAt">> = {
    content,
    mood,
    productivityLevel,
  };

  // Validate note data if provided fields are not empty
  if (content !== undefined || mood !== undefined || productivityLevel !== undefined) {
    // For validation, we need to get the existing note to provide full context
    const existingNote = await dataService.getNotes().then(notes => notes.find(n => n.id === id));
    if (!existingNote) {
      throw new AppError(`Note with ID ${id} not found`, 404);
    }

    const fullNoteData = {
      date: existingNote.date,
      content: content !== undefined ? content : existingNote.content,
      mood: mood !== undefined ? mood : existingNote.mood,
      productivityLevel: productivityLevel !== undefined ? productivityLevel : existingNote.productivityLevel,
    };

    const validationErrors = await validateDailyNote(fullNoteData);
    if (validationErrors.length > 0) {
      throw new AppError(validationErrors[0].message, 400);
    }
  }

  const updatedNote = await dataService.updateNote(id, noteData);
  if (!updatedNote) {
    throw new AppError(`Note with ID ${id} not found`, 404);
  }

  res.status(200).json({
    success: true,
    data: updatedNote,
    message: "Note updated successfully",
  });
});

/**
 * Delete a note
 * @route DELETE /api/notes/:id
 */
export const deleteNote = asyncHandler(async (req: Request, res: Response) => {
  const { id } = req.params;

  const success = await dataService.deleteNote(id);
  if (!success) {
    throw new AppError(`Note with ID ${id} not found`, 404);
  }

  res.status(200).json({
    success: true,
    message: `Note with ID ${id} deleted successfully`,
  });
});

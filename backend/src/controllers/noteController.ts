import { Request, Response } from "express";
import { v4 as uuidv4 } from "uuid";
import { DailyNote } from "../../../shared/types";
import * as dataService from "../services/dataService";
import { AppError, asyncHandler } from "../middleware/errorHandler";
import { isValidDateFormat } from "../utils/validation";

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
  const { date, content } = req.body;

  // Validate date format
  if (!isValidDateFormat(date)) {
    throw new AppError("Invalid date format. Use YYYY-MM-DD", 400);
  }

  const noteData: Omit<DailyNote, "id" | "createdAt" | "updatedAt"> = {
    date,
    content,
  };

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
  const { content } = req.body;

  const notes = await dataService.getNotes();
  const note = notes.find((n) => n.id === id);

  if (!note) {
    throw new AppError(`Note with ID ${id} not found`, 404);
  }

  const noteData: Omit<DailyNote, "id" | "createdAt" | "updatedAt"> = {
    date: note.date,
    content,
  };

  const updatedNote = await dataService.saveNote(noteData);
  res.status(200).json({
    success: true,
    data: updatedNote,
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

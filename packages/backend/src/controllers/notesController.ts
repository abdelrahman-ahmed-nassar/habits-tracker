/**
 * Notes Controller
 * Handles API endpoints for habit notes
 */
import { Request, Response } from "express";
import { NotesService } from "../services/notesService";

const notesService = new NotesService();

/**
 * Get all notes
 * @route GET /api/notes
 */
export const getAllNotes = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const notes = await notesService.getAllNotes();
    res.status(200).json(notes);
  } catch (error) {
    console.error("Error fetching notes:", error);
    res.status(500).json({ error: "Failed to fetch notes" });
  }
};

/**
 * Get a note by ID
 * @route GET /api/notes/:id
 */
export const getNoteById = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const id = req.params.id;
    const note = await notesService.getNoteById(id);

    if (!note) {
      res.status(404).json({ error: "Note not found" });
      return;
    }

    res.status(200).json(note);
  } catch (error) {
    console.error("Error fetching note:", error);
    res.status(500).json({ error: "Failed to fetch note" });
  }
};

/**
 * Create a new note
 * @route POST /api/notes
 */
export const createNote = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const note = req.body;
    const newNote = await notesService.createNote(note);
    res.status(201).json(newNote);
  } catch (error) {
    console.error("Error creating note:", error);
    res.status(500).json({ error: "Failed to create note" });
  }
};

/**
 * Update a note
 * @route PUT /api/notes/:id
 */
export const updateNote = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const id = req.params.id;
    const updates = req.body;

    const updatedNote = await notesService.updateNote(id, updates);

    if (!updatedNote) {
      res.status(404).json({ error: "Note not found" });
      return;
    }

    res.status(200).json(updatedNote);
  } catch (error) {
    console.error("Error updating note:", error);
    res.status(500).json({ error: "Failed to update note" });
  }
};

/**
 * Delete a note
 * @route DELETE /api/notes/:id
 */
export const deleteNote = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const id = req.params.id;
    const success = await notesService.deleteNote(id);

    if (!success) {
      res.status(404).json({ error: "Note not found" });
      return;
    }

    res.status(204).end();
  } catch (error) {
    console.error("Error deleting note:", error);
    res.status(500).json({ error: "Failed to delete note" });
  }
};

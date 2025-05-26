import { Request, Response } from "express";
import * as tagService from "../services/tagService";

export const getAllTags = (req: Request, res: Response) => {
  try {
    const tags = tagService.getAllTags();
    res.json(tags);
  } catch (error) {
    res.status(500).json({ message: "Error fetching tags" });
  }
};

export const getTagById = (req: Request, res: Response) => {
  try {
    const tag = tagService.getTagById(req.params.id);
    if (!tag) {
      return res.status(404).json({ message: "Tag not found" });
    }
    res.json(tag);
  } catch (error) {
    res.status(500).json({ message: "Error fetching tag" });
  }
};

export const createTag = (req: Request, res: Response) => {
  try {
    const { name, color } = req.body;

    if (!name || !color) {
      return res.status(400).json({ message: "Name and color are required" });
    }

    const newTag = tagService.createTag({ name, color });
    res.status(201).json(newTag);
  } catch (error) {
    res.status(500).json({ message: "Error creating tag" });
  }
};

export const updateTag = (req: Request, res: Response) => {
  try {
    const { name, color } = req.body;
    const updatedTag = tagService.updateTag(req.params.id, { name, color });

    if (!updatedTag) {
      return res.status(404).json({ message: "Tag not found" });
    }

    res.json(updatedTag);
  } catch (error) {
    res.status(500).json({ message: "Error updating tag" });
  }
};

export const deleteTag = (req: Request, res: Response) => {
  try {
    const success = tagService.deleteTag(req.params.id);

    if (!success) {
      return res.status(404).json({ message: "Tag not found" });
    }

    res.status(204).send();
  } catch (error) {
    res.status(500).json({ message: "Error deleting tag" });
  }
};

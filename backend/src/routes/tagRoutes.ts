import express, { Router } from "express";
import * as tagController from "../controllers/tagController";

const router: Router = express.Router();

// GET /api/tags - Get all tags
router.get("/", tagController.getAllTags);

// GET /api/tags/:id - Get a specific tag
router.get("/:id", tagController.getTagById);

// POST /api/tags - Create new tag
router.post("/", tagController.createTag);

// PUT /api/tags/:id - Update tag
router.put("/:id", tagController.updateTag);

// DELETE /api/tags/:id - Delete tag
router.delete("/:id", tagController.deleteTag);

export default router;

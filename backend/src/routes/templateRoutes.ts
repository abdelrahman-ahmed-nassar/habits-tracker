import { Router } from "express";
import {
  getAllTemplates,
  getTemplateById,
  createTemplate,
  updateTemplate,
  deleteTemplate,
} from "../controllers/templateController";

const router = Router();

/**
 * @route   GET /api/templates
 * @desc    Get all templates
 * @access  Public
 */
router.get("/", getAllTemplates);

/**
 * @route   GET /api/templates/:id
 * @desc    Get template by id
 * @access  Public
 */
router.get("/:id", getTemplateById);

/**
 * @route   POST /api/templates
 * @desc    Create new template
 * @access  Public
 */
router.post("/", createTemplate);

/**
 * @route   PUT /api/templates/:id
 * @desc    Update template
 * @access  Public
 */
router.put("/:id", updateTemplate);

/**
 * @route   DELETE /api/templates/:id
 * @desc    Delete template
 * @access  Public
 */
router.delete("/:id", deleteTemplate);

export default router;

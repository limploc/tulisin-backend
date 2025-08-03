import { Router } from "express";
import {
  getAllSections,
  getSectionById,
  createSection,
  updateSection,
  deleteSection,
} from "../controllers/section.controller";
import { authenticateToken } from "../middleware/auth";

const router = Router();

router.use(authenticateToken);

router.get("/", getAllSections);
router.post("/", createSection);
router.get("/:sectionId", getSectionById);
router.put("/:sectionId", updateSection);
router.delete("/:sectionId", deleteSection);

export default router;

import { Router } from "express";
import {
  registerUser,
  getUserProfile,
  createNote,
  processNoteWithAI,
  exampleErrorDemo,
} from "../controllers/exampleController";

const router = Router();

// Example routes demonstrating error handling
router.post("/auth/register", registerUser);
router.get("/auth/me", getUserProfile);
router.post("/notes", createNote);
router.post("/ai/process", processNoteWithAI);
router.get("/demo/errors", exampleErrorDemo);

export default router;

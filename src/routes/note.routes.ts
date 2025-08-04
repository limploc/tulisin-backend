import { Router } from "express";
import { getAllNotes, getNoteById, createNote, updateNote, deleteNote } from "../controllers/note.controller";
import { authenticateToken } from "../middleware/auth";

const router = Router();

router.use(authenticateToken);

router.get("/", getAllNotes);
router.post("/", createNote);
router.get("/:noteId", getNoteById);
router.put("/:noteId", updateNote);
router.delete("/:noteId", deleteNote);

export default router;

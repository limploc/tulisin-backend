import { Request, Response, NextFunction } from "express";
import { AuthenticatedRequest } from "../middleware/auth";
import {
  getAllNotes as getAllNotesService,
  getNoteById as getNoteByIdService,
  createNote as createNoteService,
  updateNote as updateNoteService,
  deleteNote as deleteNoteService,
} from "../services/note.service";
import { validateCreateNoteData, validateUpdateNoteData } from "../validators/note.validator";
import { BadRequestError, NotFoundError } from "../types/errors";
import { isValidUUID } from "../utils/checkValidUUID";

export async function getAllNotes(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const { user } = req as AuthenticatedRequest;
    const { sectionId, limit, offset } = req.query;

    if (!sectionId || typeof sectionId !== "string") {
      throw new BadRequestError("Section ID is required");
    }

    const parsedLimit = limit ? parseInt(limit as string, 10) : 50;
    const parsedOffset = offset ? parseInt(offset as string, 10) : 0;

    if (isNaN(parsedLimit) || parsedLimit < 1 || parsedLimit > 100) {
      throw new BadRequestError("Limit must be a number between 1 and 100");
    }

    if (isNaN(parsedOffset) || parsedOffset < 0) {
      throw new BadRequestError("Offset must be a non-negative number");
    }

    const notes = await getAllNotesService(user.userId, sectionId, parsedLimit, parsedOffset);

    res.status(200).json(notes);
  } catch (error) {
    next(error);
  }
}

export async function getNoteById(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const { user } = req as AuthenticatedRequest;
    const { noteId } = req.params;

    if (!noteId) {
      throw new BadRequestError("Note ID is required");
    }

    if (!isValidUUID(noteId)) {
      throw new NotFoundError("Invalid Note ID format");
    }

    const note = await getNoteByIdService(noteId, user.userId);

    res.status(200).json({ note });
  } catch (error) {
    next(error);
  }
}

export async function createNote(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const { user } = req as AuthenticatedRequest;
    const validatedData = validateCreateNoteData(req.body);

    const note = await createNoteService({
      title: validatedData.title,
      content: validatedData.content,
      sectionId: validatedData.sectionId,
      userId: user.userId,
    });

    res.status(201).json({ note });
  } catch (error) {
    next(error);
  }
}

export async function updateNote(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const { user } = req as AuthenticatedRequest;
    const { noteId } = req.params;

    if (!noteId) {
      throw new BadRequestError("Note ID is required");
    }

    if (!isValidUUID(noteId)) {
      throw new NotFoundError("Invalid Note ID format");
    }

    const validatedData = validateUpdateNoteData(req.body);

    const note = await updateNoteService(noteId, user.userId, {
      title: validatedData.title,
      content: validatedData.content,
      sectionId: validatedData.sectionId,
    });

    res.status(200).json({ note });
  } catch (error) {
    next(error);
  }
}

export async function deleteNote(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const { user } = req as AuthenticatedRequest;
    const { noteId } = req.params;

    if (!noteId) {
      throw new BadRequestError("Note ID is required");
    }

    if (!isValidUUID(noteId)) {
      throw new NotFoundError("Invalid Note ID format");
    }

    await deleteNoteService(noteId, user.userId);

    res.status(200).json({
      success: true,
      message: "Note deleted successfully",
    });
  } catch (error) {
    next(error);
  }
}

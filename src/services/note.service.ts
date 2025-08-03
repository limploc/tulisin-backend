import { getDatabase } from "../database/database";
import {
  findAllNotesByUserId,
  findNoteByIdAndUserId,
  createNote as createNoteRepo,
  updateNoteByIdAndUserId,
  deleteNoteByIdAndUserId,
  verifySectionOwnership,
  CreateNoteParams,
  UpdateNoteParams,
  GetNotesParams,
} from "../repositories/note.repository";
import { Note, NotesResponse } from "../models/note.model";
import { NotFoundError } from "../types/errors";

export async function getAllNotes(userId: string, sectionId: string, limit = 50, offset = 0): Promise<NotesResponse> {
  const db = getDatabase();
  const client = await db.getClient();

  try {
    const sectionExists = await verifySectionOwnership(client, sectionId, userId);
    if (!sectionExists) {
      throw new NotFoundError("Section not found");
    }

    const params: GetNotesParams = {
      userId,
      sectionId,
      limit: Math.min(Math.max(limit, 1), 100),
      offset: Math.max(offset, 0),
    };

    const result = await findAllNotesByUserId(client, params);

    return {
      notes: result.notes,
      total: result.total,
      limit: params.limit,
      offset: params.offset,
    };
  } finally {
    client.release();
  }
}

export async function getNoteById(id: string, userId: string): Promise<Note> {
  const db = getDatabase();
  const client = await db.getClient();

  try {
    const note = await findNoteByIdAndUserId(client, id, userId);

    if (!note) {
      throw new NotFoundError("Note not found");
    }

    return note;
  } finally {
    client.release();
  }
}

export async function createNote(params: CreateNoteParams): Promise<Note> {
  const db = getDatabase();

  return await db.executeTransaction(async (transaction) => {
    const sectionExists = await verifySectionOwnership(transaction, params.sectionId, params.userId);
    if (!sectionExists) {
      throw new NotFoundError("Section not found");
    }

    return await createNoteRepo(transaction, params);
  });
}

export async function updateNote(id: string, userId: string, params: UpdateNoteParams): Promise<Note> {
  const db = getDatabase();

  return await db.executeTransaction(async (transaction) => {
    if (params.sectionId) {
      const sectionExists = await verifySectionOwnership(transaction, params.sectionId, userId);
      if (!sectionExists) {
        throw new NotFoundError("Section not found");
      }
    }

    const note = await updateNoteByIdAndUserId(transaction, id, userId, params);

    if (!note) {
      throw new NotFoundError("Note not found");
    }

    return note;
  });
}

export async function deleteNote(id: string, userId: string): Promise<void> {
  const db = getDatabase();

  return await db.executeTransaction(async (transaction) => {
    const deleted = await deleteNoteByIdAndUserId(transaction, id, userId);

    if (!deleted) {
      throw new NotFoundError("Note not found");
    }
  });
}

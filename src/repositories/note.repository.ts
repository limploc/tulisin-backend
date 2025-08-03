import { QueryResult } from "pg";
import { DatabaseClient, DatabaseTransaction } from "../database/database";
import { Note, NoteMetadata } from "../models/note.model";

export interface CreateNoteParams {
  title?: string;
  content?: string;
  sectionId: string;
  userId: string;
}

export interface UpdateNoteParams {
  title?: string;
  content?: string;
  sectionId?: string;
}

export interface GetNotesParams {
  userId: string;
  sectionId: string;
  limit: number;
  offset: number;
}

interface NoteRow {
  id: string;
  title: string;
  content: string;
  section_id: string;
  user_id: string;
  created_at: string;
  updated_at: string;
}

interface NoteMetadataRow {
  id: string;
  title: string;
  section_id: string;
  user_id: string;
  created_at: string;
  updated_at: string;
}

export async function findAllNotesByUserId(
  client: DatabaseClient,
  params: GetNotesParams
): Promise<{ notes: NoteMetadata[]; total: number }> {
  const whereClause = "WHERE n.user_id = $1 AND n.section_id = $2";
  const queryParams: unknown[] = [params.userId, params.sectionId];

  const countQuery = `
    SELECT COUNT(*) as total
    FROM notes n
    ${whereClause}
  `;

  const notesQuery = `
    SELECT 
      n.id,
      n.title,
      n.section_id,
      n.user_id,
      n.created_at,
      n.updated_at
    FROM notes n
    ${whereClause}
    ORDER BY n.created_at DESC
    LIMIT $3 OFFSET $4
  `;

  queryParams.push(params.limit, params.offset);

  const countResult = await client.query(countQuery, queryParams.slice(0, -2));
  const notesResult: QueryResult<NoteMetadataRow> = await client.query(notesQuery, queryParams);

  return {
    notes: notesResult.rows.map(mapRowToNoteMetadata),
    total: parseInt(countResult.rows[0].total, 10),
  };
}

export async function findNoteByIdAndUserId(client: DatabaseClient, id: string, userId: string): Promise<Note | null> {
  const query = `
    SELECT 
      id,
      title,
      content,
      section_id,
      user_id,
      created_at,
      updated_at
    FROM notes
    WHERE id = $1 AND user_id = $2
  `;

  const result: QueryResult<NoteRow> = await client.query(query, [id, userId]);
  return result.rows.length > 0 ? mapRowToNote(result.rows[0]) : null;
}

export async function createNote(transaction: DatabaseTransaction, params: CreateNoteParams): Promise<Note> {
  const query = `
    INSERT INTO notes (title, content, section_id, user_id)
    VALUES ($1, $2, $3, $4)
    RETURNING id, title, content, section_id, user_id, created_at, updated_at
  `;

  const result: QueryResult<NoteRow> = await transaction.query(query, [
    params.title || "",
    params.content || "",
    params.sectionId,
    params.userId,
  ]);

  return mapRowToNote(result.rows[0]);
}

export async function updateNoteByIdAndUserId(
  transaction: DatabaseTransaction,
  id: string,
  userId: string,
  params: UpdateNoteParams
): Promise<Note | null> {
  const updates: string[] = [];
  const queryParams: unknown[] = [];
  let paramIndex = 1;

  if (params.title !== undefined) {
    updates.push(`title = $${paramIndex}`);
    queryParams.push(params.title);
    paramIndex++;
  }

  if (params.content !== undefined) {
    updates.push(`content = $${paramIndex}`);
    queryParams.push(params.content);
    paramIndex++;
  }

  if (params.sectionId !== undefined) {
    updates.push(`section_id = $${paramIndex}`);
    queryParams.push(params.sectionId);
    paramIndex++;
  }

  if (updates.length === 0) {
    const query = `
      SELECT 
        id,
        title,
        content,
        section_id,
        user_id,
        created_at,
        updated_at
      FROM notes
      WHERE id = $1 AND user_id = $2
    `;
    const result: QueryResult<NoteRow> = await transaction.query(query, [id, userId]);
    return result.rows.length > 0 ? mapRowToNote(result.rows[0]) : null;
  }

  updates.push(`updated_at = NOW()`);
  queryParams.push(id, userId);

  const query = `
    UPDATE notes 
    SET ${updates.join(", ")}
    WHERE id = $${paramIndex} AND user_id = $${paramIndex + 1}
    RETURNING id, title, content, section_id, user_id, created_at, updated_at
  `;

  const result: QueryResult<NoteRow> = await transaction.query(query, queryParams);
  return result.rows.length > 0 ? mapRowToNote(result.rows[0]) : null;
}

export async function deleteNoteByIdAndUserId(
  transaction: DatabaseTransaction,
  id: string,
  userId: string
): Promise<boolean> {
  const query = `
    DELETE FROM notes 
    WHERE id = $1 AND user_id = $2
  `;

  const result = await transaction.query(query, [id, userId]);
  return result.rowCount !== null && result.rowCount > 0;
}

export async function verifySectionOwnership(
  client: DatabaseClient | DatabaseTransaction,
  sectionId: string,
  userId: string
): Promise<boolean> {
  const query = `
    SELECT 1
    FROM sections
    WHERE id = $1 AND user_id = $2
    LIMIT 1
  `;

  const result = await client.query(query, [sectionId, userId]);
  return result.rows.length > 0;
}

function mapRowToNote(row: NoteRow): Note {
  return {
    id: row.id,
    title: row.title,
    content: row.content,
    sectionId: row.section_id,
    userId: row.user_id,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

function mapRowToNoteMetadata(row: NoteMetadataRow): NoteMetadata {
  return {
    id: row.id,
    title: row.title,
    sectionId: row.section_id,
    userId: row.user_id,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

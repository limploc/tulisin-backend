import { QueryResult } from "pg";
import { DatabaseClient, DatabaseTransaction } from "../database/database";

import { Section } from "../models/section.model";

export interface CreateSectionParams {
  name: string;
  userId: string;
}

export interface UpdateSectionParams {
  name: string;
}

interface SectionRow {
  id: string;
  name: string;
  user_id: string;
  created_at: string;
  updated_at: string;
  notes_count?: string;
}

export async function findAllSectionsByUserId(client: DatabaseClient, userId: string): Promise<Section[]> {
  const query = `
    SELECT 
      s.id,
      s.name,
      s.user_id,
      s.created_at,
      s.updated_at,
      COALESCE(COUNT(n.id), 0) as notes_count
    FROM sections s
    LEFT JOIN notes n ON s.id = n.section_id
    WHERE s.user_id = $1
    GROUP BY s.id, s.name, s.user_id, s.created_at, s.updated_at
    ORDER BY s.created_at DESC
  `;

  const result: QueryResult<SectionRow> = await client.query(query, [userId]);
  return result.rows.map(mapRowToSection);
}

export async function findSectionByIdAndUserId(
  client: DatabaseClient,
  id: string,
  userId: string
): Promise<Section | null> {
  const query = `
    SELECT 
      s.id,
      s.name,
      s.user_id,
      s.created_at,
      s.updated_at,
      COALESCE(COUNT(n.id), 0) as notes_count
    FROM sections s
    LEFT JOIN notes n ON s.id = n.section_id
    WHERE s.id = $1 AND s.user_id = $2
    GROUP BY s.id, s.name, s.user_id, s.created_at, s.updated_at
  `;

  const result: QueryResult<SectionRow> = await client.query(query, [id, userId]);
  return result.rows.length > 0 ? mapRowToSection(result.rows[0]) : null;
}

export async function createNewSection(
  transaction: DatabaseTransaction,
  params: CreateSectionParams
): Promise<Section> {
  const query = `
    INSERT INTO sections (name, user_id, created_at, updated_at)
    VALUES ($1, $2, NOW(), NOW())
    RETURNING id, name, user_id, created_at, updated_at
  `;

  const result: QueryResult<SectionRow> = await transaction.query(query, [params.name, params.userId]);
  const section = result.rows[0];
  return mapRowToSection({ ...section, notes_count: "0" });
}

export async function updateSectionByIdAndUserId(
  transaction: DatabaseTransaction,
  id: string,
  userId: string,
  params: UpdateSectionParams
): Promise<Section | null> {
  const query = `
    UPDATE sections 
    SET name = $1, updated_at = NOW()
    WHERE id = $2 AND user_id = $3
    RETURNING id, name, user_id, created_at, updated_at
  `;

  const result: QueryResult<SectionRow> = await transaction.query(query, [params.name, id, userId]);
  if (result.rows.length === 0) {
    return null;
  }

  const notesCountQuery = `
    SELECT COALESCE(COUNT(id), 0) as notes_count
    FROM notes
    WHERE section_id = $1
  `;

  const notesResult = await transaction.query(notesCountQuery, [id]);
  const notesCount = notesResult.rows[0].notes_count || "0";

  return mapRowToSection({ ...result.rows[0], notes_count: notesCount });
}

export async function deleteSectionByIdAndUserId(
  transaction: DatabaseTransaction,
  id: string,
  userId: string
): Promise<boolean> {
  const query = `
    DELETE FROM sections 
    WHERE id = $1 AND user_id = $2
  `;

  const result = await transaction.query(query, [id, userId]);
  return result.rowCount !== null && result.rowCount > 0;
}

function mapRowToSection(row: SectionRow): Section {
  return {
    id: row.id,
    name: row.name,
    userId: row.user_id,
    notesCount: parseInt(row.notes_count || "0", 10),
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

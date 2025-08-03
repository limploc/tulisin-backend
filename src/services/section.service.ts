import { getDatabase } from "../database/database";
import {
  findAllSectionsByUserId,
  findSectionByIdAndUserId,
  createNewSection,
  updateSectionByIdAndUserId,
  deleteSectionByIdAndUserId,
  CreateSectionParams,
  UpdateSectionParams,
} from "../repositories/section.repository";
import { Section } from "../models/section.model";
import { NotFoundError } from "../types/errors";

export async function getAllSections(userId: string): Promise<Section[]> {
  const db = getDatabase();
  const client = await db.getClient();

  try {
    return await findAllSectionsByUserId(client, userId);
  } finally {
    client.release();
  }
}

export async function getSectionById(id: string, userId: string): Promise<Section> {
  const db = getDatabase();
  const client = await db.getClient();

  try {
    const section = await findSectionByIdAndUserId(client, id, userId);

    if (!section) {
      throw new NotFoundError("Section not found");
    }

    return section;
  } finally {
    client.release();
  }
}

export async function createSection(params: CreateSectionParams): Promise<Section> {
  const db = getDatabase();

  return await db.executeTransaction(async (transaction) => {
    return await createNewSection(transaction, params);
  });
}

export async function updateSection(id: string, userId: string, params: UpdateSectionParams): Promise<Section> {
  const db = getDatabase();

  return await db.executeTransaction(async (transaction) => {
    const section = await updateSectionByIdAndUserId(transaction, id, userId, params);

    if (!section) {
      throw new NotFoundError("Section not found");
    }

    return section;
  });
}

export async function deleteSection(id: string, userId: string): Promise<void> {
  const db = getDatabase();

  return await db.executeTransaction(async (transaction) => {
    const deleted = await deleteSectionByIdAndUserId(transaction, id, userId);

    if (!deleted) {
      throw new NotFoundError("Section not found");
    }
  });
}

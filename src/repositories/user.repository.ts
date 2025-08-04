import { QueryResult } from "pg";
import { DatabaseClient, DatabaseTransaction } from "../database/database";

export interface UserRow {
  id: string;
  name: string;
  email: string;
  password_hash: string;
  created_at: Date;
  updated_at: Date;
}

export interface CreateUserData {
  name: string;
  email: string;
  passwordHash: string;
}

export async function createUser(
  client: DatabaseClient | DatabaseTransaction,
  userData: CreateUserData
): Promise<UserRow> {
  const query = `
    INSERT INTO users (name, email, password_hash, created_at, updated_at)
    VALUES ($1, $2, $3, NOW(), NOW())
    RETURNING id, name, email, password_hash, created_at, updated_at`;

  const result: QueryResult<UserRow> = await client.query(query, [
    userData.name,
    userData.email,
    userData.passwordHash,
  ]);
  return result.rows[0];
}

export async function findUserByEmail(
  client: DatabaseClient | DatabaseTransaction,
  email: string
): Promise<UserRow | null> {
  const query = `
    SELECT id, name, email, password_hash, created_at, updated_at
    FROM users
    WHERE email = $1
  `;

  const result: QueryResult<UserRow> = await client.query(query, [email]);
  return result.rows[0] || null;
}

export async function findUserById(
  client: DatabaseClient | DatabaseTransaction,
  userId: string
): Promise<UserRow | null> {
  const query = `
    SELECT id, name, email, password_hash, created_at, updated_at
    FROM users
    WHERE id = $1
  `;

  const result: QueryResult<UserRow> = await client.query(query, [userId]);
  return result.rows[0] || null;
}

export async function checkEmailExists(client: DatabaseClient | DatabaseTransaction, email: string): Promise<boolean> {
  const query = `
    SELECT 1
    FROM users
    WHERE email = $1
    LIMIT 1
  `;

  const result = await client.query(query, [email]);
  return result.rows.length > 0;
}

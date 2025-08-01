import { getDatabase } from "../database/database";
import { hashPassword, comparePassword } from "../utils/bcrypt";
import { generateToken } from "../utils/jwt";
import { AuthenticationError, ConflictError } from "../types/errors";
import {
  createUser,
  findUserByEmail,
  findUserById,
  checkEmailExists,
  UserRow,
  CreateUserData,
} from "../repositories/user.repository";
import { RegisterValidationData, LoginValidationData } from "../validators/auth.validator";

export interface User {
  id: string;
  name: string;
  email: string;
  createdAt: string;
  updatedAt: string;
}

export interface AuthResponse {
  user: User;
  token: string;
  expiresAt: string;
}

function mapUserRowToUser(userRow: UserRow): User {
  return {
    id: userRow.id,
    name: userRow.name,
    email: userRow.email,
    createdAt: userRow.created_at.toISOString(),
    updatedAt: userRow.updated_at.toISOString(),
  };
}

export async function registerUser(userData: RegisterValidationData): Promise<AuthResponse> {
  const db = getDatabase();

  return db.executeTransaction(async (transaction) => {
    const emailExists = await checkEmailExists(transaction, userData.email);
    if (emailExists) {
      throw new ConflictError("Email already exists");
    }

    const passwordHash = await hashPassword(userData.password);

    const createUserData: CreateUserData = {
      name: userData.name,
      email: userData.email,
      passwordHash,
    };

    const userRow = await createUser(transaction, createUserData);

    const user = mapUserRowToUser(userRow);

    const tokenData = generateToken({
      userId: user.id,
      email: user.email,
    });

    return {
      user,
      token: tokenData.token,
      expiresAt: tokenData.expiresAt.toISOString(),
    };
  });
}

export async function loginUser(loginData: LoginValidationData): Promise<AuthResponse> {
  const db = getDatabase();
  const client = await db.getClient();

  try {
    const userRow = await findUserByEmail(client, loginData.email);

    if (!userRow) {
      throw new AuthenticationError("Invalid email or password");
    }

    const isPasswordValid = await comparePassword(loginData.password, userRow.password_hash);

    if (!isPasswordValid) {
      throw new AuthenticationError("Invalid email or password");
    }

    const user = mapUserRowToUser(userRow);

    const tokenData = generateToken({
      userId: user.id,
      email: user.email,
    });

    return {
      user,
      token: tokenData.token,
      expiresAt: tokenData.expiresAt.toISOString(),
    };
  } finally {
    client.release();
  }
}

export async function getCurrentUser(userId: string): Promise<User> {
  const db = getDatabase();
  const client = await db.getClient();

  try {
    const userRow = await findUserById(client, userId);

    if (!userRow) {
      throw new AuthenticationError("User not found");
    }

    return mapUserRowToUser(userRow);
  } finally {
    client.release();
  }
}

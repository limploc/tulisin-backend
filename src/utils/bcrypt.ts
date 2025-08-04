import bcrypt from "bcryptjs";
import { getSaltRounds } from "../config/config";

export async function hashPassword(password: string): Promise<string> {
  const { saltRounds } = getSaltRounds();
  return bcrypt.hash(password, saltRounds);
}

export async function comparePassword(password: string, hashedPassword: string): Promise<boolean> {
  return bcrypt.compare(password, hashedPassword);
}

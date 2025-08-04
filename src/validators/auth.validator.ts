import { ValidationError, ValidationErrorDetail } from "../types/errors";

export interface RegisterValidationData {
  name: string;
  email: string;
  password: string;
}

export interface LoginValidationData {
  email: string;
  password: string;
}

function isValidEmail(email: string): boolean {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
}

export function validateRegisterData(data: unknown): RegisterValidationData {
  const errors: ValidationErrorDetail[] = [];

  if (!data || typeof data !== "object") {
    throw new ValidationError("Invalid request body", [
      { field: "body", message: "Request body must be a valid JSON object" },
    ]);
  }

  const { name, email, password } = data as Record<string, unknown>;

  if (!name || typeof name !== "string") {
    errors.push({ field: "name", message: "Name is required and must be a string" });
  } else if (name.trim().length < 2) {
    errors.push({ field: "name", message: "Name must be at least 2 characters long" });
  } else if (name.trim().length > 100) {
    errors.push({ field: "name", message: "Name must not exceed 100 characters" });
  }

  if (!email || typeof email !== "string") {
    errors.push({ field: "email", message: "Email is required and must be a string" });
  } else if (!isValidEmail(email)) {
    errors.push({ field: "email", message: "Email must be a valid email address" });
  }

  if (!password || typeof password !== "string") {
    errors.push({ field: "password", message: "Password is required and must be a string" });
  } else if (password.length < 6) {
    errors.push({ field: "password", message: "Password must be at least 6 characters long" });
  }

  if (errors.length > 0) {
    throw new ValidationError("Validation failed", errors);
  }

  return {
    name: (name as string).trim(),
    email: (email as string).toLowerCase().trim(),
    password: password as string,
  };
}

export function validateLoginData(data: unknown): LoginValidationData {
  const errors: ValidationErrorDetail[] = [];

  if (!data || typeof data !== "object") {
    throw new ValidationError("Invalid request body", [
      { field: "body", message: "Request body must be a valid JSON object" },
    ]);
  }

  const { email, password } = data as Record<string, unknown>;

  if (!email || typeof email !== "string") {
    errors.push({ field: "email", message: "Email is required and must be a string" });
  } else if (!isValidEmail(email)) {
    errors.push({ field: "email", message: "Email must be a valid email address" });
  }

  if (!password || typeof password !== "string") {
    errors.push({ field: "password", message: "Password is required and must be a string" });
  } else if (password.length < 6) {
    errors.push({ field: "password", message: "Password must be at least 6 characters long" });
  }

  if (errors.length > 0) {
    throw new ValidationError("Validation failed", errors);
  }

  return {
    email: (email as string).toLowerCase().trim(),
    password: password as string,
  };
}

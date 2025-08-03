import { ValidationError, ValidationErrorDetail } from "../types/errors";

export interface CreateSectionValidationData {
  name: string;
}

export interface UpdateSectionValidationData {
  name: string;
}

export function validateCreateSectionData(data: unknown): CreateSectionValidationData {
  const errors: ValidationErrorDetail[] = [];

  if (!data || typeof data !== "object") {
    throw new ValidationError("Invalid request body", [
      { field: "body", message: "Request body must be a valid JSON object" },
    ]);
  }

  const { name } = data as Record<string, unknown>;

  if (!name || typeof name !== "string") {
    errors.push({ field: "name", message: "Name is required and must be a string" });
  } else if (name.trim().length < 1) {
    errors.push({ field: "name", message: "Name cannot be empty" });
  } else if (name.trim().length > 100) {
    errors.push({ field: "name", message: "Name must not exceed 100 characters" });
  }

  if (errors.length > 0) {
    throw new ValidationError("Validation failed", errors);
  }

  return {
    name: (name as string).trim(),
  };
}

export function validateUpdateSectionData(data: unknown): UpdateSectionValidationData {
  const errors: ValidationErrorDetail[] = [];

  if (!data || typeof data !== "object") {
    throw new ValidationError("Invalid request body", [
      { field: "body", message: "Request body must be a valid JSON object" },
    ]);
  }

  const { name } = data as Record<string, unknown>;

  if (!name || typeof name !== "string") {
    errors.push({ field: "name", message: "Name is required and must be a string" });
  } else if (name.trim().length < 1) {
    errors.push({ field: "name", message: "Name cannot be empty" });
  } else if (name.trim().length > 100) {
    errors.push({ field: "name", message: "Name must not exceed 100 characters" });
  }

  if (errors.length > 0) {
    throw new ValidationError("Validation failed", errors);
  }

  return {
    name: (name as string).trim(),
  };
}
